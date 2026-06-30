@echo off
title Super Battle Golf League - Local Preview
cd /d "%~dp0"

set PY=
where python >nul 2>&1 && set PY=python
if not defined PY where py >nul 2>&1 && set PY=py -3

if not defined PY (
  echo.
  echo  Python was not found on this PC.
  echo  Install it from https://www.python.org/downloads/ then try again.
  echo.
  pause
  exit /b 1
)

echo.
echo  Super Battle Golf League - local preview
echo  ----------------------------------------
echo  URL:    http://localhost:8765
echo  Folder: %cd%
echo.
echo  Save your edits, then refresh the browser to see changes.
echo  Press Ctrl+C in this window to stop the server.
echo.

start "" http://localhost:8765
%PY% -m http.server 8765

echo.
pause
