# hyperalfred

⚡🔎🎩 Makes Alfred works with Hyper terminal

![hyperalfred](https://raw.githubusercontent.com/gjuchault/hyperalfred/master/hyperalfred.gif)

## Installation

### Hyper plugin

Using Hyper, you can simply use `hyper`:

```
hyper i hyperalfred
```

### Alfred script

Open Alfred Preferences, go to « Features », « Terminal / Shell ».
Select « Custom » as Application, and paste the following (replace `USERNAME` with your actual username):

```applescript
on alfred_script(q)
    write_to_file(q, "/Users/USERNAME/.hyper_plugins/hyperalfred.txt", false)
    tell application "Hyper" to activate
end alfred_script

on write_to_file(this_data, target_file, append_data)
    try
        tell application "System Events" to exists file target_file
        if not the result then do shell script "> " & quoted form of target_file
        set the open_target_file to open for access target_file with write permission
        if append_data is false then set eof of the open_target_file to 0
        write this_data to the open_target_file starting at eof
        close access the open_target_file
        return true
    on error e
        try
            display dialog e
            close access target_file
        end try
        return false
    end try
end write_to_file
```

If you do not know what username you should use, open a Terminal and run `whoami` or `id -un`

You're ready to go !

## How it works

As you may know, Electron apps are known to be not working with Apple Script. I'm using a buffer file (located in `~/.hyper_plugins/hyperalfred.txt`)
Once the plugin is loaded on Hyper, it checks that file for a command. If there is one, it just write it using Hyper API and clears the file.

## Caveats

hyperalfred will only work if Hyper is **not** already the focused application.
