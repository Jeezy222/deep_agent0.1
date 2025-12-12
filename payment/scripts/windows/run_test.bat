@echo off
echo Running test script with full output capture...
cd /d "d:\Trae\支付"
python test_checkout.py > test_output.log 2>&1
echo Exit code: %errorlevel%
echo Test output:
type test_output.log