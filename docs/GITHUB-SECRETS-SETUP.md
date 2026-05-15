# Setup de GitHub Secrets para auto-deploy

Esto se hace **UNA SOLA VEZ** y olvidás. Tarda ~3 minutos.

---

## Paso 1 · Crear cuenta FTP en hPanel (Hostinger)

1. Entrá a https://hpanel.hostinger.com
2. Click en el dominio **kreathur.agency** → "Manage"
3. Menú izquierdo → **Files → FTP Accounts**
4. Click **"+ Create FTP Account"**
   - **FTP Account Name:** `deploy`
   - **Password:** click "Generate" → copia y guarda en lugar seguro
   - **Directory:** `public_html`
   - **Quota:** sin límite (o el máximo permitido)
5. Click **Create**

Después de crear, anotá lo que muestra hPanel:
- **FTP server / hostname** (algo como `ftp.kreathur.agency` o `srv123.main-hosting.eu`)
- **FTP username** (será `deploy@kreathur.agency` o `kreathur_deploy` — dependiendo de cómo lo registró Hostinger)
- **Password** (la que generaste)

---

## Paso 2 · Pegar los 3 secrets en GitHub

1. Entrá a https://github.com/kreathuragency-prog/kreathur-landing
2. **Settings** (arriba a la derecha del repo) → menú izquierdo **Secrets and variables → Actions**
3. Click **"New repository secret"** (3 veces, uno por cada secret):

| Name | Value |
|---|---|
| `FTP_HOST` | El "FTP server" que anotaste en el paso 1 |
| `FTP_USERNAME` | El "FTP username" del paso 1 |
| `FTP_PASSWORD` | La password generada |

Cada uno se queda **cifrado** dentro de GitHub — nunca aparece en logs, ni puede leerse después de guardado, ni siquiera por ti.

---

## Paso 3 · Activar el workflow

El archivo `.github/workflows/deploy.yml` ya está en el repo (después de que lo subas vos manualmente — ver razón abajo).

Para que dispare el primer deploy:

```bash
cd C:\Users\matia\AppData\Local\Temp\kreathur-landing-deploy
git commit --allow-empty -m "chore: trigger first auto-deploy"
git push origin main
```

Andá a https://github.com/kreathuragency-prog/kreathur-landing/actions y vas a ver el deploy corriendo en vivo. En ~60 segundos:

- Verifica los 3 secrets ✓
- Sube todos los archivos por FTPS (cifrado) ✓
- Hace smoke test a /, /inicio, /quienes-somos, /servicios, /blog ✓

---

## Por qué necesitás copiar `deploy.yml` manualmente al repo

GitHub bloquea que un OAuth token push archivos en `.github/workflows/` por seguridad (necesita scope especial `workflow`). Vos sí podés desde tu CLI:

```bash
# 1) Copiar el template al lugar correcto
mkdir -p C:\Users\matia\AppData\Local\Temp\kreathur-landing-deploy\.github\workflows
copy ^
  C:\Users\matia\AppData\Local\Temp\kreathur-landing-deploy\docs\auto-deploy-template.yml ^
  C:\Users\matia\AppData\Local\Temp\kreathur-landing-deploy\.github\workflows\deploy.yml

# 2) Commit + push (usá GitHub Desktop si tu PAT no tiene scope workflow)
cd C:\Users\matia\AppData\Local\Temp\kreathur-landing-deploy
git add .github/workflows/deploy.yml
git commit -m "ci: activate auto-deploy on push to main"
git push origin main
```

Si tu PAT (Personal Access Token) no tiene scope `workflow`, hacelo desde **GitHub Desktop** (la app), o desde el navegador (subiendo el archivo directo en el editor web de GitHub).

---

## Verificar que funciona

Después del primer push exitoso, abrí:
- https://github.com/kreathuragency-prog/kreathur-landing/actions → el run debería estar verde
- https://www.kreathur.agency → la nueva web debería estar live
- https://www.kreathur.agency/quienes-somos → tu historia
- https://www.kreathur.agency/servicios → la página de servicios

Si alguna devuelve 404 o muestra WordPress viejo, esperá 1-2 minutos más (el cache propaga). Si sigue, abrí el run de GitHub Actions y revisá los logs — los errores aparecen ahí en español.

---

## Rotar credenciales

Si algún día sospechás que la password FTP se filtró:

1. hPanel → FTP Accounts → cambiar password de `deploy@kreathur.agency`
2. GitHub → Secrets → editar `FTP_PASSWORD` con el nuevo valor
3. Listo — el próximo deploy usa la nueva

Los secrets viejos NO quedan en historial de GitHub. Solo el valor más reciente.
