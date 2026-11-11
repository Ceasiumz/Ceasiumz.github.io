using static MouseMacro.MacroEngine;

namespace MouseMacro;

internal sealed class MacroWindow : Form
{
    private sealed class Macro(RecordingData recording, string name)
    {
        public RecordingData Recording { get; } = recording;
        public string DefaultName { get; } = name;
        public string Name { get; set; } = name;
        public TriggerKey? Trigger { get; set; }
        public bool Relative { get; set; }
        public bool SkipIdle { get; set; }
        public bool RestoreCursor { get; set; }
        public bool Enabled { get; set; } = true;
    }

    private readonly MacroEngine engine;
    private readonly NotifyIcon tray;
    private readonly ContextMenuStrip menu = new();
    private readonly System.Windows.Forms.Timer timer = new() { Interval = 100 };
    private readonly Dictionary<TriggerKey, Macro> triggers = [];
    private readonly DataGridView library = new()
    {
        Dock = DockStyle.Fill, SelectionMode = DataGridViewSelectionMode.FullRowSelect,
        MultiSelect = false, RowHeadersVisible = false, AllowUserToAddRows = false,
        AllowUserToDeleteRows = false, AllowUserToResizeRows = false, StandardTab = true,
        BackgroundColor = SystemColors.Window, AccessibleName = "已录制的宏"
    };
    private readonly TextBox name = new() { Dock = DockStyle.Fill, MaxLength = 80, AccessibleName = "宏名称" };
    private readonly ComboBox mode = new() { Dock = DockStyle.Fill, DropDownStyle = ComboBoxStyle.DropDownList, AccessibleName = "鼠标定位" };
    private readonly CheckBox skipIdle = new() { Text = "跳过空帧", AutoSize = true };
    private readonly CheckBox restoreCursor = new() { Text = "结束后鼠标归位", AutoSize = true };
    private const int EnabledColumn = 4;

    private readonly Button record = new() { Text = "录制新宏", AutoSize = true };
    private readonly Button play = new() { Text = "回放所选", AutoSize = true };
    private readonly Button stop = new() { Text = "停止回放", AutoSize = true };
    private readonly Button remove = new() { Text = "删除所选", AutoSize = true };
    private readonly Button bind = new() { Text = "设定触发键", AutoSize = true };
    private readonly Button clear = new() { Text = "清除绑定", AutoSize = true };
    private readonly Label trigger = new() { AutoSize = true, Margin = new Padding(0, 8, 12, 0) };
    private readonly Label status = new() { Dock = DockStyle.Fill, AutoEllipsis = true };
    private Macro? binding;
    private string? lastMessage;
    private bool exiting, loading, interrupted, confirmingDelete;
    private int nextNumber = 1;

    private DataGridViewRow? SelectedRow => library.SelectedRows.Count == 1 ? library.SelectedRows[0] : null;
    private Macro? Selected => SelectedRow?.Tag as Macro;

    public MacroWindow()
    {
        Text = "鼠标宏";
        Icon = SystemIcons.Application;
        AutoScaleMode = AutoScaleMode.Dpi;
        ClientSize = new Size(660, 580);
        MinimumSize = new Size(550, 560);
        StartPosition = FormStartPosition.CenterScreen;
        engine = new MacroEngine { InterceptKey = InterceptKeypress };

        library.Columns.Add(TextColumn("宏名称", 140, fill: true));
        library.Columns.Add(TextColumn("回放触发键", 126));
        library.Columns.Add(TextColumn("鼠标定位", 95));
        library.Columns.Add(TextColumn("事件数", 76));
        library.Columns.Add(new DataGridViewCheckBoxColumn
        {
            HeaderText = "启用宏", Width = 76, SortMode = DataGridViewColumnSortMode.NotSortable
        });
        library.RowTemplate.Height = Math.Max(28, Font.Height + 10);

        mode.Items.AddRange(["绝对屏幕坐标", "相对于回放起点"]);
        var layout = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 1, Padding = new Padding(16) };
        layout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
        layout.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        layout.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        layout.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        layout.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        layout.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        layout.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        Controls.Add(layout);

        var heading = Caption("宏列表");
        heading.Font = new Font(Font.FontFamily, Font.Size + 4, FontStyle.Bold);
        layout.Controls.Add(heading, 0, 0);
        layout.Controls.Add(ButtonBar(record, play, stop, remove), 0, 1);
        layout.Controls.Add(library, 0, 2);

        var details = new TableLayoutPanel { Dock = DockStyle.Top, AutoSize = true, ColumnCount = 2, Margin = new Padding(3, 12, 3, 6) };
        details.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 106));
        details.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
        for (int row = 0; row < 4; row++)
            details.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        details.Controls.Add(Caption("宏名称"), 0, 0);
        details.Controls.Add(name, 1, 0);
        details.Controls.Add(Caption("回放触发键"), 0, 1);
        details.Controls.Add(ButtonBar(trigger, bind, clear), 1, 1);
        details.Controls.Add(Caption("鼠标定位"), 0, 2);
        details.Controls.Add(mode, 1, 2);
        details.Controls.Add(Caption("回放选项"), 0, 3);
        details.Controls.Add(ButtonBar(skipIdle, restoreCursor), 1, 3);
        layout.Controls.Add(details, 0, 3);

        layout.Controls.Add(Caption("默认 F8 录制，F10 停止。离开此窗口后，已绑定的键可全局回放。"), 0, 4);
        status.AutoSize = true;
        status.Margin = new Padding(3, 5, 3, 0);
        layout.Controls.Add(status, 0, 5);

        library.SelectionChanged += (_, _) => LoadSelection();
        library.CurrentCellDirtyStateChanged += (_, _) =>
        {
            if (library.IsCurrentCellDirty && library.CurrentCell?.ColumnIndex == EnabledColumn)
                library.CommitEdit(DataGridViewDataErrorContexts.Commit);
        };
        library.CellValueChanged += (_, e) =>
        {
            if (e.ColumnIndex != EnabledColumn || e.RowIndex < 0)
                return;
            DataGridViewRow row = library.Rows[e.RowIndex];
            if (row.Tag is Macro macro)
            {
                macro.Enabled = row.Cells[EnabledColumn].Value is true;
                lastMessage = macro.Enabled ? $"已启用“{macro.Name}”。" : $"已停用“{macro.Name}”。";
                RefreshStatus();
            }
        };
        name.TextChanged += (_, _) =>
        {
            if (loading || Selected is not { } macro || SelectedRow is not { } row)
                return;
            macro.Name = string.IsNullOrWhiteSpace(name.Text) ? macro.DefaultName : name.Text.Trim();
            row.Cells[0].Value = macro.Name;
        };
        name.Leave += (_, _) => { if (Selected is { } macro) name.Text = macro.Name; };
        mode.SelectedIndexChanged += (_, _) =>
        {
            if (loading || Selected is not { } macro || SelectedRow is not { } row)
                return;
            macro.Relative = mode.SelectedIndex == 1;
            row.Cells[2].Value = macro.Relative ? "相对" : "绝对";
        };
        skipIdle.CheckedChanged += (_, _) => { if (!loading && Selected is { } macro) macro.SkipIdle = skipIdle.Checked; };
        restoreCursor.CheckedChanged += (_, _) => { if (!loading && Selected is { } macro) macro.RestoreCursor = restoreCursor.Checked; };
        bind.Click += (_, _) =>
        {
            binding = binding == null ? Selected : null;
            lastMessage = null;
            RefreshStatus();
        };
        clear.Click += (_, _) => { if (Selected is { } macro) SetBinding(macro, null); };
        Deactivate += (_, _) => CancelBinding();
        record.Click += (_, _) => StartRecording();
        play.Click += (_, _) => { if (Selected is { } macro) Play(macro); };
        stop.Click += (_, _) => Stop();
        remove.Click += (_, _) => RemoveSelected();

        menu.Items.Add("打开宏列表", null, (_, _) => OpenSettings());
        menu.Items.Add("录制新宏 / 停止", null, (_, _) => { if (engine.Recording || engine.Playing) Stop(); else StartRecording(); });
        menu.Items.Add("退出", null, (_, _) => { exiting = true; Close(); });
        tray = new NotifyIcon { Icon = Icon, Text = Text, ContextMenuStrip = menu, Visible = true };
        tray.DoubleClick += (_, _) => OpenSettings();
        timer.Tick += (_, _) =>
        {
            if (engine.TakeResult(out string? error))
                SetMessage(error ?? (interrupted ? "已停止回放。" : "回放已结束。"), error != null);
            RefreshStatus();
        };
        timer.Start();
        LoadSelection();
    }

    private static DataGridViewTextBoxColumn TextColumn(string title, int width, bool fill = false) => new()
    {
        HeaderText = title, Width = width, ReadOnly = true,
        AutoSizeMode = fill ? DataGridViewAutoSizeColumnMode.Fill : DataGridViewAutoSizeColumnMode.None,
        SortMode = DataGridViewColumnSortMode.NotSortable
    };

    private static Label Caption(string text) => new()
    {
        Text = text, AutoSize = true, Anchor = AnchorStyles.Left,
        Margin = new Padding(3, 5, 3, 5)
    };

    private static FlowLayoutPanel ButtonBar(params Control[] controls)
    {
        var bar = new FlowLayoutPanel { Dock = DockStyle.Top, AutoSize = true, WrapContents = false, Margin = Padding.Empty };
        bar.Controls.AddRange(controls);
        return bar;
    }

    private bool InterceptKeypress(TriggerKey key, Native.Point? mouse)
    {
        if (confirmingDelete)
            return false;

        if (binding is { } macro)
        {
            if (mouse is { } point && Bounds.Contains(point.X, point.Y))
                return false;
            binding = null;
            BeginInvoke(() => SetBinding(macro, key));
        }
        else if ((engine.Recording && key.Key is Keys.F8 or Keys.F10) ||
                 (engine.Playing && key.Key == Keys.F10))
            BeginInvoke(Stop);
        else if (engine.Recording || engine.Playing)
            return false;
        else if ((!Visible || !ContainsFocus) && triggers.TryGetValue(key, out Macro? match) && match.Enabled &&
                 (mouse is not { } position || !Native.IsMacroControlAt(position, Visible ? Handle : 0)))
            BeginInvoke(() => Play(match));
        else if (key.Key == Keys.F8 && triggers.GetValueOrDefault(key)?.Enabled != true)
            BeginInvoke(StartRecording);
        else
            return false;

        return true;
    }

    private void SetBinding(Macro macro, TriggerKey? key)
    {
        if (key is { } value && triggers.TryGetValue(value, out Macro? other) && other != macro)
        {
            SetMessage($"“{value}”已分配给“{other.Name}”。请清除原绑定或选择另一个键。", true);
            RefreshStatus();
            return;
        }
        if (macro.Trigger is { } previous)
            triggers.Remove(previous);
        macro.Trigger = key;
        if (key is { } assigned)
            triggers.Add(assigned, macro);
        foreach (DataGridViewRow row in library.Rows)
        {
            if (row.Tag == macro)
            {
                row.Cells[1].Value = key?.ToString() ?? "未绑定";
                break;
            }
        }
        lastMessage = key.HasValue ? $"已绑定 {key}。" : "已清除绑定。";
        RefreshStatus();
    }

    private void CancelBinding()
    {
        if (binding == null)
            return;
        binding = null;
        RefreshStatus();
    }

    private void LoadSelection()
    {
        binding = null;
        loading = true;
        Macro? macro = Selected;
        name.Text = macro?.Name ?? "";
        mode.SelectedIndex = macro == null ? -1 : macro.Relative ? 1 : 0;
        skipIdle.Checked = macro?.SkipIdle == true;
        restoreCursor.Checked = macro?.RestoreCursor == true;
        loading = false;
        RefreshStatus();
    }

    private void StartRecording()
    {
        if (engine.Recording || engine.Playing || binding != null)
            return;
        try
        {
            engine.StartRecording();
            lastMessage = null;
        }
        catch (System.ComponentModel.Win32Exception error)
        {
            SetMessage(error.Message, true);
        }
        RefreshStatus();
    }

    private void Stop()
    {
        if (engine.Recording)
        {
            if (engine.FinishRecording() is { } recording)
            {
                var macro = new Macro(recording, $"宏 {nextNumber++}");
                int index = library.Rows.Add(macro.Name, "未绑定", "绝对", recording.Events.Length, true);
                library.Rows[index].Tag = macro;
                SelectRow(index);
                lastMessage = $"已添加“{macro.Name}”。";
            }
            else
                lastMessage = "此次录制没有输入事件。";
        }
        else if (engine.Playing)
        {
            interrupted = true;
            engine.StopPlayback();
        }
        RefreshStatus();
    }

    private void Play(Macro macro)
    {
        if (engine.Recording || engine.Playing || binding != null || !macro.Enabled)
            return;
        try
        {
            engine.TakeResult(out _);
            engine.Play(macro.Recording, new PlaybackOptions(macro.Relative, macro.SkipIdle, macro.RestoreCursor));
            interrupted = false;
            lastMessage = null;
        }
        catch (System.ComponentModel.Win32Exception error)
        {
            SetMessage($"“{macro.Name}” · {error.Message}", true);
        }
        RefreshStatus();
    }

    private void RemoveSelected()
    {
        if (Selected is not { } macro || SelectedRow is not { } row)
            return;

        confirmingDelete = true;
        try
        {
            if (MessageBox.Show(this, $"删除“{macro.Name}”？", "删除宏", MessageBoxButtons.YesNo,
                MessageBoxIcon.Question, MessageBoxDefaultButton.Button2) != DialogResult.Yes)
                return;
        }
        finally
        {
            confirmingDelete = false;
        }

        if (macro.Trigger is { } key)
            triggers.Remove(key);
        int index = row.Index;
        library.Rows.Remove(row);
        if (library.Rows.Count > 0)
            SelectRow(Math.Min(index, library.Rows.Count - 1));
        lastMessage = $"已删除“{macro.Name}”。";
        LoadSelection();
    }

    private void SelectRow(int index)
    {
        DataGridViewRow row = library.Rows[index];
        library.CurrentCell = row.Cells[0];
        library.ClearSelection();
        row.Selected = true;
        LoadSelection();
    }

    private void SetMessage(string message, bool error)
    {
        lastMessage = message;
        if (!Visible && error)
            tray.ShowBalloonTip(4000, Text, message, ToolTipIcon.Error);
    }

    private void RefreshStatus()
    {
        bool idle = !engine.Recording && !engine.Playing;
        Macro? selected = Selected;
        bool editable = idle && selected != null && binding == null;
        record.Enabled = idle && binding == null;
        play.Enabled = editable && selected?.Enabled == true;
        remove.Enabled = name.Enabled = mode.Enabled = skipIdle.Enabled = restoreCursor.Enabled = editable;
        bool readOnly = !idle || binding != null;
        if (library.ReadOnly != readOnly)
            library.ReadOnly = readOnly;
        bind.Enabled = idle && selected != null;
        clear.Enabled = editable && selected?.Trigger != null;
        stop.Enabled = engine.Playing;
        bind.Text = binding == null ? "设定触发键" : "取消设定";
        trigger.Text = selected?.Trigger?.ToString() ?? "未绑定";
        status.Text = engine.Recording ? $"录制中 · {engine.Count} 个事件 · F8 或 F10 结束"
            : engine.Playing ? "回放中 · F10 停止"
            : binding != null ? "按键盘键，或在窗口外按鼠标键。也可点击「取消设定」。"
            : lastMessage ?? (library.Rows.Count == 0 ? "列表为空。点击「录制新宏」或按 F8 开始。" : $"就绪 · {library.Rows.Count} 条宏");
        tray.Text = engine.Recording ? "鼠标宏 · 录制中" : engine.Playing ? "鼠标宏 · 回放中" : "鼠标宏";
    }

    private void OpenSettings()
    {
        Show();
        WindowState = FormWindowState.Normal;
        Activate();
    }

    protected override void OnFormClosing(FormClosingEventArgs e)
    {
        if (!exiting && e.CloseReason == CloseReason.UserClosing)
        {
            e.Cancel = true;
            CancelBinding();
            Hide();
        }
        base.OnFormClosing(e);
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing && !IsDisposed)
        {
            timer.Dispose();
            engine?.Dispose();
            tray?.Dispose();
            menu.Dispose();
        }
        base.Dispose(disposing);
    }
}






