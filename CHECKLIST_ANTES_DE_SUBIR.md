# ✅ Checklist de Seguridad - Antes de Subir a GitHub

## 🔐 Seguridad Crítica

### Variables de Entorno
- [ ] Verificar que `.env.local` existe y tiene tus credenciales
- [ ] Verificar que `.env` está en `.gitignore`
- [ ] Verificar que `env.example` NO tiene credenciales reales
- [ ] Ejecutar: `git status` y verificar que NO aparece ningún archivo `.env*`

### Credenciales en Código
- [ ] Buscar en el código credenciales hardcodeadas
- [ ] Buscar API keys en el código
- [ ] Buscar tokens de acceso
- [ ] Buscar contraseñas

**Comando para buscar**:
```bash
# Buscar posibles credenciales
grep -r "SUPABASE_URL" src/
grep -r "SUPABASE_ANON_KEY" src/
grep -r "password" src/
grep -r "secret" src/
```

---

## 📁 Archivos y Carpetas

### Archivos que NO deben subirse
- [ ] `.env` o `.env.local` → **CRÍTICO**
- [ ] `node_modules/` → **Grande e innecesario**
- [ ] `.next/` → **Generado automáticamente**
- [ ] `build/` o `dist/` → **Generado automáticamente**
- [ ] `.DS_Store` → **Archivos de sistema Mac**
- [ ] `Thumbs.db` o `desktop.ini` → **Archivos de sistema Windows**

### Archivos que SÍ deben subirse
- [ ] `src/` → **Todo el código fuente**
- [ ] `public/` → **Archivos estáticos**
- [ ] `package.json` → **Dependencias**
- [ ] `.gitignore` → **Configuración de Git**
- [ ] `README_GITHUB.md` → **Documentación**
- [ ] `env.example` → **Plantilla de variables**
- [ ] `tailwind.config.ts` → **Configuración**
- [ ] `tsconfig.json` → **Configuración TypeScript**
- [ ] `next.config.ts` → **Configuración Next.js**

**Verificar**:
```bash
git status
# Debería mostrar solo archivos relevantes, no node_modules ni .env
```

---

## 🧹 Limpieza de Código

### Código Comentado
- [ ] Eliminar console.log() innecesarios
- [ ] Eliminar código comentado que ya no se usa
- [ ] Eliminar imports no utilizados
- [ ] Eliminar archivos temporales o de prueba

**Comando**:
```bash
# Buscar console.log
grep -r "console.log" src/

# Buscar debugger
grep -r "debugger" src/
```

### Archivos de Prueba
- [ ] Eliminar archivos de prueba temporales
- [ ] Eliminar carpetas de testing vacías
- [ ] Eliminar scripts de prueba

---

## 📝 Documentación

### README
- [ ] El README tiene instrucciones claras de instalación
- [ ] Se menciona cómo configurar variables de entorno
- [ ] Se incluyen capturas de pantalla o demo (opcional)
- [ ] Se listan las tecnologías usadas
- [ ] Se incluye información de contacto

### Comentarios en Código
- [ ] Funciones complejas tienen comentarios
- [ ] Archivos principales tienen descripción
- [ ] TODOs están documentados

---

## 🔍 Verificación de .gitignore

### Ejecutar este comando:
```bash
git status
```

### ✅ Debe MOSTRAR (en verde):
- Archivos `.ts`, `.tsx`, `.js`, `.jsx`
- Archivos `.css`, `.scss`
- Archivos de configuración (`.json`, `.config.ts`)
- Archivos `.md` (documentación)
- Carpeta `public/`
- Carpeta `src/`

### ❌ NO debe MOSTRAR (si aparecen, agregarlos a .gitignore):
- `.env` o `.env.local`
- `node_modules/`
- `.next/`
- `build/` o `dist/`
- `.DS_Store`
- `*.log`
- `.vscode/settings.json` (configuración personal)

---

## 🧪 Testing

### Antes de subir:
- [ ] El proyecto compila sin errores
  ```bash
  npm run build
  ```
- [ ] El proyecto corre en desarrollo
  ```bash
  npm run dev
  ```
- [ ] No hay errores de TypeScript
  ```bash
  npx tsc --noEmit
  ```
- [ ] No hay errores de linting (si tienes ESLint configurado)
  ```bash
  npm run lint
  ```

---

## 📦 Dependencias

### package.json
- [ ] Todas las dependencias están en `package.json`
- [ ] No hay dependencias no utilizadas
- [ ] Las versiones son correctas

### Verificar instalación limpia:
```bash
# Eliminar node_modules
rm -rf node_modules

# Reinstalar
npm install

# Verificar que funciona
npm run dev
```

---

## 🌐 GitHub Repository

### Configuración del Repositorio
- [ ] Nombre del repositorio es descriptivo
- [ ] Tiene una descripción clara
- [ ] Visibilidad es la correcta (Public/Private)
- [ ] README se muestra correctamente en GitHub

### Branches
- [ ] La rama principal se llama `main` (no `master`)
- [ ] No hay ramas temporales que no quieras subir

---

## 🚨 Última Verificación

### Antes de hacer `git push`:

1. **Revisar el último commit**:
   ```bash
   git log --stat
   ```

2. **Ver qué archivos se van a subir**:
   ```bash
   git diff --name-only origin/main
   ```

3. **Ver el contenido de archivos específicos**:
   ```bash
   git show HEAD:ruta/al/archivo
   ```

4. **Si algo está mal, deshacer el commit**:
   ```bash
   git reset --soft HEAD~1
   # Hacer los cambios necesarios
   git add .
   git commit -m "Mensaje corregido"
   ```

---

## 🔥 Si ya subiste algo por error

### Si subiste .env por accidente:

**URGENTE - Sigue estos pasos INMEDIATAMENTE**:

1. **Eliminar el archivo del repositorio**:
   ```bash
   git rm --cached .env.local
   git commit -m "Remove sensitive file"
   git push
   ```

2. **Rotar TODAS las credenciales**:
   - Ve a Supabase Dashboard
   - Regenera las API keys
   - Actualiza tu `.env.local` con las nuevas keys

3. **Verificar el historial**:
   ```bash
   git log --all --full-history -- .env.local
   ```

4. **Si necesitas limpiar el historial**:
   ```bash
   # CUIDADO: Esto reescribe el historial
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.local" \
     --prune-empty --tag-name-filter cat -- --all
   
   git push origin --force --all
   ```

### Si subiste node_modules:

```bash
git rm -r --cached node_modules
git commit -m "Remove node_modules"
git push
```

---

## ✅ Checklist Final

**Marca cada item antes de hacer `git push`**:

- [ ] ✅ Ejecuté `git status` y no veo archivos sensibles
- [ ] ✅ Ejecuté `npm run build` sin errores
- [ ] ✅ Revisé que `.env` está en `.gitignore`
- [ ] ✅ Revisé el README y está completo
- [ ] ✅ Eliminé console.log() innecesarios
- [ ] ✅ No hay credenciales hardcodeadas
- [ ] ✅ El proyecto funciona después de reinstalar dependencias
- [ ] ✅ Revisé el último commit con `git log`
- [ ] ✅ El nombre del repositorio es correcto
- [ ] ✅ Tengo respaldo local por si algo sale mal

---

## 🎯 Comando Final

Si todo está bien, ejecuta:

```bash
# Ver resumen de lo que se va a subir
git status

# Subir a GitHub
git push -u origin main
```

---

## 📞 En Caso de Emergencia

Si algo sale mal y necesitas revertir:

```bash
# Ver commits recientes
git log --oneline

# Volver a un commit anterior (LOCAL)
git reset --hard COMMIT_ID

# Forzar el push (CUIDADO)
git push --force origin main
```

**⚠️ ADVERTENCIA**: `--force` reescribe el historial. Úsalo solo si estás seguro.

---

<div align="center">

**🔒 La seguridad es lo primero**

Mejor prevenir que lamentar

</div>

