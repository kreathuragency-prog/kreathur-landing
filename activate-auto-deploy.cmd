@echo off
REM ===========================================================================
REM Activador del auto-deploy a Hostinger
REM
REM Corre esto UNA VEZ. Después, cada `git push origin main` despliega solo.
REM ===========================================================================

setlocal enabledelayedexpansion

cd /d "%~dp0"

echo.
echo === ACTIVADOR AUTO-DEPLOY KREATHUR.AGENCY ===
echo.

REM Paso 1: refrescar token GitHub con scope workflow
echo [1/4] Refrescando token GitHub para permitir workflows...
echo       Va a abrirse el navegador. Acepta y vuelve a esta ventana.
echo.
gh auth refresh -h github.com -s workflow
if errorlevel 1 (
    echo.
    echo ERROR: gh auth refresh fallo. Revisa que tengas GitHub CLI instalado.
    exit /b 1
)

REM Paso 2: copiar workflow al lugar correcto
echo.
echo [2/4] Copiando workflow template...
if not exist ".github\workflows" mkdir ".github\workflows"
copy /Y "docs\auto-deploy-template.yml" ".github\workflows\deploy.yml" >nul
if errorlevel 1 (
    echo ERROR: no se pudo copiar el template.
    exit /b 1
)
echo       OK

REM Paso 3: commit + push
echo.
echo [3/4] Commit + push del workflow...
git add .github/workflows/deploy.yml
git commit -m "ci: activate FTP auto-deploy on push to main"
git push origin main
if errorlevel 1 (
    echo.
    echo ERROR: push fallo. Revisa que tu auth tenga scope workflow.
    exit /b 1
)
echo       OK

REM Paso 4: instrucciones de secrets
echo.
echo [4/4] Falta UNA accion manual: agregar los 3 secrets en GitHub
echo.
echo       Abriendo la pagina de Secrets en tu navegador...
start https://github.com/kreathuragency-prog/kreathur-landing/settings/secrets/actions
echo.
echo       Agrega estos 3 secrets (botón "New repository secret"):
echo.
echo       Name           Value
echo       ----           -----
echo       FTP_HOST       (el FTP server que ves en hPanel)
echo       FTP_USERNAME   deploy@kreathur.agency  (o el que creaste)
echo       FTP_PASSWORD   (la password que generaste en hPanel)
echo.
echo       Si todavia no creaste la cuenta FTP, abre:
echo       https://hpanel.hostinger.com  (Files / FTP Accounts)
echo.
echo       Despues del primer push, mira el progreso en:
echo       https://github.com/kreathuragency-prog/kreathur-landing/actions
echo.
echo === LISTO ===
echo.
pause
