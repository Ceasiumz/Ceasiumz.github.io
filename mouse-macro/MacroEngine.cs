using System.Diagnostics;
using System.Runtime.InteropServices;

namespace MouseMacro;

internal sealed class MacroEngine : IDisposable
{
    internal enum EventKind { KeyDown, KeyUp, Move, ButtonDown, ButtonUp, Wheel }

    internal readonly record struct Key(uint VirtualKey, uint Scan, bool Extended)
    {
        public Key Identity => Scan == 0 || VirtualKey == (uint)Keys.Pause
            ? this
            : this with { VirtualKey = 0 };
    }

    internal readonly record struct MacroEvent(
        long Time, EventKind Kind, Key Key = default, Native.Point Position = default,
        uint Flags = 0, uint Data = 0);

    internal sealed record RecordingData(Native.Point Origin, MacroEvent[] Events);

    internal readonly record struct PlaybackOptions(bool Relative, bool SkipIdle, bool RestoreCursor);

    internal readonly record struct TriggerKey(Keys Key, bool Extended)
    {
        public override string ToString() => Key switch
        {
            Keys.LButton => "鼠标左键",
            Keys.RButton => "鼠标右键",
            Keys.MButton => "鼠标中键",
            Keys.XButton1 => "鼠标侧键 1",
            Keys.XButton2 => "鼠标侧键 2",
            Keys.Enter => Extended ? "小键盘 Enter" : "Enter",
            Keys.LShiftKey => "左 Shift",
            Keys.RShiftKey => "右 Shift",
            Keys.LControlKey => "左 Ctrl",
            Keys.RControlKey => "右 Ctrl",
            Keys.LMenu => "左 Alt",
            Keys.RMenu => "右 Alt",
            >= Keys.D0 and <= Keys.D9 => ((int)Key - (int)Keys.D0).ToString(),
            _ => Key.ToString()
        };
    }

    private readonly Native.Hook keyboardCallback;
    private readonly Native.Hook mouseCallback;
    private readonly Dictionary<TriggerKey, bool> heldKeys = [];
    private readonly List<MacroEvent> events = [];
    private nint keyboardHook, mouseHook;
    private long started;
    private Native.Point origin;
    private CancellationTokenSource? cancellation;
    private Task? playback;

    public bool Recording { get; private set; }
    public bool Playing => playback is { IsCompleted: false };
    public int Count => events.Count;
    public Func<TriggerKey, Native.Point?, bool>? InterceptKey { get; set; }

    public MacroEngine()
    {
        keyboardCallback = OnKeyboard;
        mouseCallback = OnMouse;
        try
        {
            keyboardHook = Native.InstallHook(13, keyboardCallback);
            mouseHook = Native.InstallHook(14, mouseCallback);
        }
        catch
        {
            Dispose();
            throw;
        }
    }

    public void StartRecording()
    {
        if (Playing)
            return;

        origin = Native.CursorPosition();
        events.Clear();
        started = Stopwatch.GetTimestamp();
        Recording = true;
    }

    public RecordingData? FinishRecording()
    {
        if (!Recording)
            return null;

        Recording = false;
        var result = events.Count > 0 ? new RecordingData(origin, events.ToArray()) : null;
        events.Clear();
        return result;
    }

    public void StopPlayback() => cancellation?.Cancel();

    public void Play(RecordingData recording, PlaybackOptions options)
    {
        if (Recording || playback != null)
            return;

        Native.Point anchor = options.Relative || options.RestoreCursor ? Native.CursorPosition() : default;
        var source = new CancellationTokenSource();
        cancellation = source;
        playback = Task.Run(() => Replay(recording, options, anchor, source.Token));
    }

    public bool TakeResult(out string? error)
    {
        error = null;
        if (playback is not { IsCompleted: true })
            return false;

        error = playback.Exception?.GetBaseException().Message;
        playback = null;
        cancellation?.Dispose();
        cancellation = null;
        return true;
    }

    private nint OnKeyboard(int code, nint message, nint data)
    {
        if (code >= 0)
        {
            var input = Marshal.PtrToStructure<Native.KeyboardHookData>(data);
            if ((input.Flags & 0x10) == 0)
            {
                bool up = (input.Flags & 0x80) != 0;
                var key = new TriggerKey((Keys)input.VirtualKey, (input.Flags & 1) != 0);
                if (Intercept(key, up))
                    return 1;

                if (Recording)
                    events.Add(new MacroEvent(Elapsed(), up ? EventKind.KeyUp : EventKind.KeyDown,
                        new Key(input.VirtualKey, input.Scan, (input.Flags & 1) != 0)));
            }
        }

        return Native.CallNextHookEx(keyboardHook, code, message, data);
    }

    private nint OnMouse(int code, nint message, nint data)
    {
        if (code >= 0 && (Recording || (int)message != 0x0200))
        {
            var input = Marshal.PtrToStructure<Native.MouseHookData>(data);
            if ((input.Flags & 1) == 0)
            {
                (EventKind kind, uint flags) = (int)message switch
                {
                    0x0200 => (EventKind.Move, 0u),
                    0x0201 => (EventKind.ButtonDown, 0x0002u),
                    0x0202 => (EventKind.ButtonUp, 0x0002u),
                    0x0204 => (EventKind.ButtonDown, 0x0008u),
                    0x0205 => (EventKind.ButtonUp, 0x0008u),
                    0x0207 => (EventKind.ButtonDown, 0x0020u),
                    0x0208 => (EventKind.ButtonUp, 0x0020u),
                    0x020A => (EventKind.Wheel, 0x0800u),
                    0x020B => (EventKind.ButtonDown, 0x0080u),
                    0x020C => (EventKind.ButtonUp, 0x0080u),
                    0x020E => (EventKind.Wheel, 0x1000u),
                    _ => (EventKind.Move, uint.MaxValue)
                };

                if (flags != uint.MaxValue)
                {
                    uint mouseData = kind == EventKind.Wheel
                        ? unchecked((uint)(short)(input.Data >> 16))
                        : input.Data >> 16;
                    if (kind is EventKind.ButtonDown or EventKind.ButtonUp)
                    {
                        Keys button = flags switch
                        {
                            0x0002 => Keys.LButton,
                            0x0008 => Keys.RButton,
                            0x0020 => Keys.MButton,
                            _ => mouseData == 1 ? Keys.XButton1 : Keys.XButton2
                        };
                        if (Intercept(new TriggerKey(button, false), kind == EventKind.ButtonUp, input.Position))
                            return 1;
                    }

                    if (Recording)
                        events.Add(new MacroEvent(Elapsed(), kind, Position: input.Position, Flags: flags, Data: mouseData));
                }
            }
        }

        return Native.CallNextHookEx(mouseHook, code, message, data);
    }

    private bool Intercept(TriggerKey key, bool up, Native.Point? position = null)
    {
        if (up)
            return heldKeys.Remove(key, out bool captured) && captured;
        if (heldKeys.TryGetValue(key, out bool handled))
            return handled;

        bool intercept = InterceptKey?.Invoke(key, position) == true;
        heldKeys.Add(key, intercept);
        return intercept;
    }

    private long Elapsed() => Stopwatch.GetTimestamp() - started;

    private static void Replay(RecordingData recording, PlaybackOptions options, Native.Point anchor, CancellationToken token)
    {
        var activeKeys = new Dictionary<Key, Key>();
        var activeButtons = new HashSet<(uint Flags, uint Data)>();
        long started = Stopwatch.GetTimestamp();
        long previous = 0;
        long due = 0;
        long idleLimit = Stopwatch.Frequency / 4;
        try
        {
            foreach (MacroEvent entry in recording.Events)
            {
                long gap = entry.Time - previous;
                previous = entry.Time;
                due += options.SkipIdle && activeKeys.Count == 0 && activeButtons.Count == 0
                    ? Math.Min(gap, idleLimit)
                    : gap;
                long remaining;
                while ((remaining = due - (Stopwatch.GetTimestamp() - started)) > 0)
                {
                    int ms = (int)Math.Clamp(Math.Ceiling(remaining * 1000.0 / Stopwatch.Frequency), 1, int.MaxValue);
                    if (token.WaitHandle.WaitOne(ms))
                        return;
                }
                if (token.IsCancellationRequested)
                    return;

                if (entry.Kind == EventKind.KeyDown)
                {
                    Key key = entry.Key;
                    Native.SendKey(key.VirtualKey, key.Scan, key.Extended, false);
                    activeKeys.TryAdd(key.Identity, key);
                }
                else if (entry.Kind == EventKind.KeyUp)
                {
                    if (!activeKeys.TryGetValue(entry.Key.Identity, out Key key))
                        continue;
                    Native.SendKey(key.VirtualKey, key.Scan, key.Extended, true);
                    activeKeys.Remove(entry.Key.Identity);
                }
                else
                {
                    Native.Point position = entry.Position;
                    if (options.Relative)
                        position = new Native.Point(anchor.X + position.X - recording.Origin.X,
                            anchor.Y + position.Y - recording.Origin.Y);
                    Native.MoveCursor(position);

                    var button = (entry.Flags, entry.Data);
                    if (entry.Kind == EventKind.ButtonDown)
                    {
                        Native.SendMouse(entry.Flags, entry.Data);
                        activeButtons.Add(button);
                    }
                    else if (entry.Kind == EventKind.ButtonUp && activeButtons.Contains(button))
                    {
                        Native.SendMouse(entry.Flags << 1, entry.Data);
                        activeButtons.Remove(button);
                    }
                    else if (entry.Kind == EventKind.Wheel)
                        Native.SendMouse(entry.Flags, entry.Data);
                }
            }
        }
        finally
        {
            Exception? releaseError = null;
            foreach (Key key in activeKeys.Values.Reverse())
            {
                try { Native.SendKey(key.VirtualKey, key.Scan, key.Extended, true); }
                catch (InvalidOperationException error) { releaseError ??= error; }
            }
            foreach (var (flags, data) in activeButtons)
            {
                try { Native.SendMouse(flags << 1, data); }
                catch (InvalidOperationException error) { releaseError ??= error; }
            }

            if (options.RestoreCursor)
            {
                try { Native.MoveCursor(anchor); }
                catch (System.ComponentModel.Win32Exception error) { releaseError ??= error; }
            }

            if (releaseError != null)
                throw releaseError;
        }
    }

    public void Dispose()
    {
        StopPlayback();
        if (keyboardHook != 0)
            Native.UnhookWindowsHookEx(keyboardHook);
        if (mouseHook != 0)
            Native.UnhookWindowsHookEx(mouseHook);
        try { playback?.GetAwaiter().GetResult(); }
        catch (Exception) when (playback?.IsFaulted == true) { }
        cancellation?.Dispose();
    }
}



