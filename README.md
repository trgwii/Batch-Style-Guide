# Batch Style Guide

This document describes some best-practices for how to organize projects written partly or fully in the Batch programming language.

These practices have been developed by thorough examination of my own batch experiences and the solutions I should have taken up from the start.

Without further ado, here are my thoughts on how to ensure maintainability, modularity, and security and safety (at least as much as possible) within batch programs.

## Table of Contents

1. [Batch Style Guide](#batch-style-guide)
	1. [Table of Contents](#table-of-contents)
	1. [Definitions](#definitions)
		1. [Directives](#directives)
	1. [General code style](#general-code-style)
		1. [Capitalization](#capitalization)
		1. [Tabs vs spaces](#tabs-vs-spaces)
		1. [Line endings](#line-endings)
	1. [Terminal output](#terminal-output)
		1. [@-prefix](#-prefix)
		1. [echo off](#echo-off)
		1. [Redirecting output](#redirecting-output)
			1. [Hiding output](#hiding-output)
			1. [echo](#echo)
	1. [Comments](#comments)
	1. [Statements and control structures](#statements-and-control-structures)
		1. [If statements](#if-statements)
		1. [For-loops](#for-loops)
		1. [Sleeping](#sleeping)
	1. [Modules and files](#modules-and-files)
		1. [call](#call)
			1. [Returning values](#returning-values)
		1. [Local variables](#local-variables)
			1. [Caveats](#caveats)
		1. [Local files](#local-files)
	1. [Resources](#resources)

## Definitions

Some of the terms used in this document may sound foreign to you, so I'll try to explain them as best I can here.

### Directives

Directives are commands that don't really act as traditional command-line commands, but instead somehow modify the current environment or terminal emulator.

Examples of directives are:

* `setlocal` / `endlocal` - They change the way variable scoping works in the current environment
* `echo on` / `echo off` - These toggle if lines of source code are outputted during program execution.
* `color` - This command changes the color or background color of the terminal emulator it is running in, and not the traditional way by changing the output of other commands to output ANSI escape codes, but through some backdoor mechanism present in `cmd.exe`.

These commands don't really do anything except modify the behavior of other parts of your environment, they are not commands. They are directives for your environment.


## General code style

This section covers general code style choices for batch, meant to improve readability and commonalities.

### Capitalization

Batch does not treat builtin commands different based on capitalization, therefore I recommend using lowercase for commands and options. I haven't seen a command that doesn't accept options in lowercase, and I don't expect that there are any builtin commands that have this limitation.

Variable names should be snake_cased or lowerCamelCased, depending on preference, just make sure you have a consistent naming scheme, and don't mix capitalizations across variable names (even though batch ignores casing in variable names). Keeping the casing consistent ensures less developer confusion, and less mental overhead.

### Tabs vs spaces

Batch treats hard tabs well in all cases, and tabs produce lower file sizes, which of course doesn't matter in compiled languages, but in batch it increases performance slightly.

```batch
@if "%x%"=="2" (
	echo x is 2
)
```

You should also prefer "blocks" using parentheses over single-line if statements and for-loops.

### Line endings

Batch can sometimes cause problems if you use Unix-style line-endings, so I recommend to always use the Windows-style line-endings (CRLF / `\r\n`) for all batch files.

Almost all common batch commands like `echo` will also output Windows-style line-endings, so using CRLF for everything reduces the possible problems that can be caused by different types of line-endings.

In addition, `notepad.exe` on all Windows versions since Windows 95 recognize and handle CRLF correctly, while only very recently in Windows 10 has notepad gotten preliminary support for Unix-style line endings. Preventing the code from being read by notepad is effectively a bad type of source obfuscation, and also makes it easy for unknowing users to mess up your programs by opening and saving them in notepad, causing all Unix-style endings to be lost.

## Terminal output

This section describes best-practices for controlling and dealing with how your batch application interfaces and communicates with the terminal and, by extension, the user.

### @-prefix

`@` is a prefix for commands, and works similarly to the familiar infix pipe operators (`|`, `>`, `<`), in that it somehow modifies the terminal output / behavior of the command it preceedes.

By default batch will output each line of source code as it runs your program. `@` hides this extra output for the given line / command it preceedes. I recommend always preceeding your commands with `@` in order to keep your terminal output clean and tidy.

If I create a new batch file containing the following:

```batch
echo Hello World!
```

The resulting terminal output when running this command normally is:

```batch
C:\Users\Thomas\Documents\Batch>test.bat

C:\Users\Thomas\Documents\Batch>echo Hello World!
Hello World!
```

This is quite verbose, as the user probably doesn't want or need to see all lines of source code being ran.

Editing the script to:

```batch
@echo Hello World!
```

Results in:

```batch
C:\Users\Thomas\Documents\Batch>test.bat
Hello World!
```

This looks much tidier and behaves more like what we would expect from other languages. I recommend you prefix all your commands with `@` in order to hide the source line from being outputted. An obvious exception to this rule would be when you want to display some lines of code for debugging purposes.

### echo off

Many batch programs will have a directive like the following at the top of the main script:

```batch
@echo off
```

This piece of code will change the behavior of your environment to never output the line of source code being ran, very similar to how `@` behaves, but instead of disabling output per-line, `echo off` will do it globally.

While this directive is fine for very simple scripts, this is NOT a good practice for scalable batch applications, despite its' obvious prevalence in existing programs.

The reason for this is that it only knows how to change the behavior globally, as in per-process, and whenever you DO want to see the source code outputted, enabling it will almost always lead to more output than you normally want or expect.

I recommend you try to avoid `echo off` for all your batch programs, and instead prefer to use `@`.

### Redirecting output

This section describes how to properly utilize the pipe operators (`|`, `>`, `<`) present in batch, and how to avoid common mistakes using them.

#### Hiding output

[//]: # (TODO: Write about placing > first in command)

#### echo

[//]: # (TODO: Write about how echo keeps the last space)

## Comments

Comments in batch are often created using a slightly confusing label syntax:

```batch
::My comment
```

I recommend avoiding this, as it has a semantic meaning (creating a label named `:My comment`), and may conflict with existing labels. Labels also don't behave properly when nested inside for-loops. Instead, you should use the `rem` command. It behaves nicely with other commands and can be nested with `&&` to produce an end-of-line comment:

```batch
@rem This is a comment
@echo Hello World! && rem This is an inline comment
```

## Statements and control structures

This section describes various best-practices for writing statements and control structures.

### If statements

[//]: # (TODO)

### For-loops

[//]: # (TODO)

### Sleeping

Sleeping / waiting the script is an unusual case, and should be avoided if possible. Don't introduce race conditions, there are better ways to handle asynchronicity.

With that said, let's get to how to sleep in a batch program. Many different Stack Overflow posts will tell you to use something like:

```batch
@ping -n 10 127.0.0.1
```

Or other similarly strange tools in order to get the desired behavior. None of these are needed, Windows includes a tool to wait called `timeout`, it's just not named `sleep` like people are used to in Unix-based systems.

Here's how to use it:

```batch
@rem Allow user to press a key to continue
@timeout /t 10

@rem Force the user to wait
@timeout /t 10 /nobreak

@rem Hide countdown command output
@>NUL timeout /t 10 /nobreak
```

## Modules and files

Batch is global by default, so it will not help you ensure modularity and isolation between your batch scripts. Because of this limitation, ensuring this kind of isolation commonly found within other programming languages is up to you, the developer.

I recommend you treat your applications as modules themselves, apply the practices in this section to both your modules and your main application scripts. That way, your applications will hopefully be pluggable, so they can be used on their own or as a module within a larger application.

### call

I recommend you always prefer the `call` command over other methods for calling scripts from other scripts. Some of the other methods are:

```batch
@cmd /c "command"
@start /wait "title" "command"
@"command"
```

The main reason for using `call` over these is that it has none of the buggy behaviors of directly typing the name of a script to run it, and is more performant than `start` and `cmd`, as well as the fact that `call` can properly accept and utilize positional arguments.

I'll illustrate with a simple numeric `add.bat`:

```batch
@setlocal

@set a=%~1
@set b=%~2

@set /A result=%a%+%b%
@echo %result%

@endlocal
```

With `call`, using this file is as simple as:

```batch
C:\Users\Thomas\Documents\Batch>call add 1 2
3
```

I also recommend always using `%~N`, where N is the argument index (1-indexed) in order to automatically strip quotes from arguments. Since I have used it in `add.bat` above, I can just as easily do:

```batch
C:\Users\Thomas\Documents\Batch>call add "1" "2"
3
```

#### Returning values

Now we know how to call scripts with arguments, but if the script has a value to return to the caller, we use a user-specified variable name to assign to.

Implementation example:

```batch
@setlocal

@set a=%~1
@set b=%~2
@set output=%~3

@set /A result=%a%+%b%

@endlocal && set "%output%=%result%"
```

Thanks to batch's variable expansion, we can safely do this, and scripts can now easily return values to the caller:

```batch
@call add 1 2 result
@echo %result%
```

You should generally prefer return values over echoing, as they are easier to deal with by the caller. These return value arguments also have the benefit of allowing multiple return values, which means you can have return value contexts (set one variable in one case, another in the other case).

I recommend placing return variable names at the end of your argument list, or at the very beginning if you want to accept a variadic number of input arguments.

### Local variables

Any batch script that defines or mutates variables should be surrounded by `setlocal` / `endlocal` directives. I say directives, because these don't really act as traditional commands, in the same way that `color` doesn't.

A properly formatted batch module or file might look like this:

```batch
@setlocal

@rem ... script contents ...

@endlocal
```

#### Caveats

In some scripts, you might want to exit early, there might be a case where you already have the required information to proceed, and you don't need to continue running the script to the end. Due to the way batch executes scripts, this may have a positive performance impact.

When you have defined a script using `setlocal` / `endlocal`, you will have to remember that `endlocal` MUST pair up with `setlocal`, even on early exits.

This script is NOT well-behaved, and may cause unpredictable and hard-to-debug problems, even in other parts of your application:

```batch
@setlocal

@set user_id=%~1
@if "%user_id%"=="1" (
	echo Administrator
	exit /b
)
@db getUser "%user_id%"

@endlocal
```

The solution to this is to add the missing `endlocal`, so each call to `setlocal` is followed by a call to `endlocal`, even on early exits:

```batch
@setlocal

@set user_id=%~1
@if "%user_id%"=="1" (
	echo Administrator
	endlocal
	exit /b
)
@db getUser "%user_id%"

@endlocal
```

### Local files

When working with local files, things can quickly get very messy in batch. Sometimes you can use relative paths, sometimes you can't, sometimes it depends on where the user launched your program from. This section describes how to organize your batch programs to reduce this messiness.

The solution to almost all of these problems is the combination of `pushd` and `popd`. These behave as a slightly improved version of the `cd` command, and also exist in many non-Windows-environments.

They have almost the same semantics as `setlocal` / `endlocal`, and I'll illustrate why below.

Suppose we want to display a text file to the user. The best command for this is `type` (very similar to `cat` in Unix-based systems). A simple file-displaying script might look like this:

```batch
@type employees.txt
@pause
```

This will display the text file and wait for the user to press a key.

We're not declaring any variables in this script, so not having `setlocal` / `endlocal` is fine, and improves performance.

However, now you have another script in a different folder, and you want to reuse this handy employee display script. So you use `call` like so from your other script:

```batch
@call employees\display.bat
```

And the output of running this script becomes:

```batch
The system cannot find the file specified.
Press any key to continue . . .
```

That's not what we wanted. The reason for this is that the working directory of the process has changed, and the relative path used inside `display.bat` (`employees.txt`) will no longer work when called from a different folder. `pushd` and `popd` fix this problem for almost all cases.

Modifying `display.bat` to the following will enable it to run like normal, as well as work correctly when called from the other script:

```batch
@pushd "%~dp0"

@type employees.bat
@pause

@popd
```

This will do a couple of things:

* Change the current working directory to "%~dp0" (which expands to the same directory as `display.bat` is in)
* Run the script
* Change the current working directory back to what it was prior to running the script (ensuring the change is only local)

The quotes around "%~dp0" are also important, as the path may contain spaces, and we want to ensure the script still works even if it is contained inside a path with spaces.

Finally, you should realize that the other script has the same problem, `employees\display.bat` won't resolve correctly if the other script is called within a process with a different working directory!

So we fix the other script as well to also use `pushd` and `popd`:

```batch
@pushd "%~dp0"

@call employees\display.bat

@popd
```

Now both of the scripts will work well. I recommend that ANY script that calls other scripts or uses local paths should also use `pushd` and `popd`. An obvious exception would be a script meant to behave as a command-line tool, where you want to run commands relative to the users' current working directory.

Be aware that the same caveats for `setlocal` / `endlocal` relating to early exits mentioned above also apply to `pushd` and `popd`, so apply the same solution to fix these cases.

## Resources

Batch does not have great documentation or support. This is a list of my favorite batch web-resources.

* [SS64.com](https://ss64.com/nt/)
