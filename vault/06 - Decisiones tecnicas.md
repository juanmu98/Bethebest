# 06 - Decisiones tecnicas

Registro ligero de decisiones (la mas reciente arriba).

## 2026-06-07 — Nombres de notas sin tildes
- **Decision:** los archivos de la boveda no llevan tildes ni caracteres especiales en el nombre.
- **Por que:** la carpeta `vault/` se borro una vez (proceso externo) y se sospecha de los nombres con tildes; mejor evitar problemas.

## 2026-06-07 — Boveda de Obsidian dentro del repo
- **Decision:** documentar en `vault/` dentro de la carpeta del proyecto.
- **Alternativa descartada:** vault separado fuera del repo (mas dificil de sincronizar).

## 2026-06-07 — No subir a GitHub automaticamente
- **Decision:** el agente no hace `push` por su cuenta; solo cuando el usuario lo pide.

## 2026-06-07 — Enfoque web tipo app (no nativa)
- **Decision:** HTML + Tailwind (CDN) + JS puro + LocalStorage, en vez de React Native/Flutter.
- **Por que:** mas facil de probar para un principiante; se puede envolver despues para la Play Store.
- **Consecuencia:** la parte social real queda para Fase 3 (necesita servidor).

## 2026-06-07 — Estilo oscuro + verde lima
- **Decision:** tema oscuro (`#0d0f0c`) con acento verde lima (`#bdf60a`).
- **Por que:** estetica deportiva, elegida por el usuario.

#bethebest #decisiones
