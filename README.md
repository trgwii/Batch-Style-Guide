# Batch Style Guide

This document describes some best-practices for how to organize projects written partly or fully in the Batch programming language.

These practices have been developed by thorough examination of my own batch experiences and the solutions I should have taken up from the start.

Without further ado, here are my thoughts on how to ensure maintainability, modularity, and security and safety (at least as much as possible) within batch programs.

## Definitions

Some of the terms used in this document may sound foreign to you, so I'll try to explain them as best I can here.

### Directives

Directives are commands that don't really act as traditional command-line commands, but instead somehow modify the current environment or terminal emulator.

Examples of directives are:

* `setlocal` / `endlocal` - They change the way variable scoping works in the current environment
* `echo on` / `echo off` - These toggle if lines of source code are outputted during program execution.
* `color` - This command changes the color or background color of the terminal emulator it is running in, and not the traditional way by changing the output of other commands to output ANSI escape codes, but through some backdoor mechanism present in cmd.exe.

These commands don't really do anything except modify the behavior of other parts of your environment, they are not commands. They are directives for your environment.

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

## Comments

Comments in batch are often created using a slightly confusing label syntax:

```batch
::My comment
```

[//]: # (TODO: Add link to future for-loop section)

I recommend avoiding this, as it has a semantic meaning(creating a label named `:My comment`), and may conflict with existing labels. Labels also don't behave properly when nested inside for-loops. Instead, you should use the `rem` command. It behaves nicely with other commands and can be nested with `&` to produce an end-of-line comment:

```batch
@rem This is a comment
@echo Hello World! & rem This is an inline comment
```

## Statements and control structures

This section describes various best-practices for writing statements and control structures.

[//]: # (TODO: Statements and control structures)

## Modules and files

Batch is global by default, so it will not help you ensure modularity and isolation between your batch scripts. Because of this limitation, ensuring this kind of isolation commonly found within other programming languages is up to you, the developer.

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

## Resources

