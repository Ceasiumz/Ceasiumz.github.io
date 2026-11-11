using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Text;

namespace MouseMacro;

internal static class Native
{
    internal const uint ExtendedKey = 1;
    internal const uint KeyUp = 2;
    private const uint ScanCode = 8;

    internal delegate nint Hook(int code, nint message, nint data);

    [StructLayout(LayoutKind.Sequential)]
    internal readonly record struct Point(int X, int Y);

    [StructLayout(LayoutKind.Sequential)]
    internal struct KeyboardHookData
    {
        public uint VirtualKey, Scan, Flags, Time;
        public nuint Extra;
    }

    [StructLayout(LayoutKind.Sequential)]
    internal struct MouseHookData
    {
        public Point Position;
        public uint Data, Flags, Time;
        public nuint Extra;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct MouseInput
    {
        public int X, Y;
        public uint Data, Flags, Time;
        public nuint Extra;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct KeyboardInput
    {
        public ushort VirtualKey, Scan;
        public uint Flags, Time;
        public nuint Extra;
    }

    [StructLayout(LayoutKind.Explicit)]
    private struct InputData
    {
        [FieldOffset(0)] public MouseInput Mouse;
        [FieldOffset(0)] public KeyboardInput Keyboard;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct Input
    {
        public uint Type;
        public InputData Data;
    }

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode)]
    private static extern nint GetModuleHandle(string? name);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern nint SetWindowsHookEx(int type, Hook callback, nint module, uint thread);

    [DllImport("user32.dll")]
    internal static extern bool UnhookWindowsHookEx(nint hook);

    [DllImport("user32.dll")]
    internal static extern nint CallNextHookEx(nint hook, int code, nint message, nint data);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool GetCursorPos(out Point point);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool SetCursorPos(int x, int y);

    [DllImport("user32.dll")]
    private static extern uint MapVirtualKey(uint code, uint mapType);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern uint SendInput(uint count, ref Input input, int size);

    internal static nint InstallHook(int type, Hook callback)
    {
        nint handle = SetWindowsHookEx(type, callback, GetModuleHandle(null), 0);
        return handle != 0 ? handle : throw new Win32Exception();
    }

    internal static Point CursorPosition()
    {
        return GetCursorPos(out Point point) ? point : throw new Win32Exception();
    }

    internal static void MoveCursor(Point position)
    {
        if (!SetCursorPos(position.X, position.Y))
            throw new Win32Exception();
    }

    [DllImport("user32.dll")]
    private static extern nint WindowFromPoint(Point point);

    [DllImport("user32.dll")]
    private static extern nint GetAncestor(nint window, uint flags);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern int GetClassName(nint window, StringBuilder name, int capacity);

    internal static bool IsMacroControlAt(Point position, nint settingsWindow)
    {
        nint window = GetAncestor(WindowFromPoint(position), 2);
        if (window == 0)
            return false;
        if (window == settingsWindow)
            return true;

        var name = new StringBuilder(32);
        return GetClassName(window, name, name.Capacity) != 0 &&
            name.ToString() is "Shell_TrayWnd" or "Shell_SecondaryTrayWnd";
    }

    internal static void SendKey(uint virtualKey, uint scan, bool extended, bool up)
    {
        // Pause has a special scan sequence. Its virtual key preserves the key identity.
        bool useScan = scan != 0 && virtualKey != (uint)Keys.Pause;
        if (!useScan && virtualKey != (uint)Keys.Pause)
            extended = (MapVirtualKey(virtualKey, 4) >> 8) == 0xE0;

        Send(new Input
        {
            Type = 1,
            Data = new InputData
            {
                Keyboard = new KeyboardInput
                {
                    VirtualKey = useScan ? (ushort)0 : (ushort)virtualKey,
                    Scan = useScan ? (ushort)scan : (ushort)0,
                    Flags = (useScan ? ScanCode : 0) | (extended ? ExtendedKey : 0) | (up ? KeyUp : 0)
                }
            }
        });
    }

    internal static void SendMouse(uint flags, uint data)
    {
        Send(new Input { Data = new InputData { Mouse = new MouseInput { Flags = flags, Data = data } } });
    }

    private static void Send(Input input)
    {
        if (SendInput(1, ref input, Marshal.SizeOf<Input>()) != 1)
            throw new InvalidOperationException("Windows 拒绝了模拟输入，请检查目标程序的权限。", new Win32Exception());
    }
}



