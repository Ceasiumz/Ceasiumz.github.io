namespace MouseMacro;

internal static class Program
{
    [STAThread]
    private static void Main()
    {
        using var instance = new Mutex(true, @"Local\MouseMacro.Recorder", out bool firstInstance);
        if (!firstInstance)
        {
            MessageBox.Show("鼠标宏已在运行。请从系统托盘打开。", "鼠标宏");
            return;
        }

        ApplicationConfiguration.Initialize();
        try
        {
            using var window = new MacroWindow();
            Application.Run(window);
        }
        catch (System.ComponentModel.Win32Exception error)
        {
            MessageBox.Show(error.Message, "鼠标宏启动失败", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }
}


