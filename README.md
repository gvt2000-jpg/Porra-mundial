# Porras Mundial

Proyecto mínimo para gestionar porras del Mundial usando Next.js y Supabase.

Setup rápido:

1. Clona este repo.
2. Crea un proyecto en Supabase y copia las credenciales.
3. Rellena `.env.local` usando `.env.example`.
4. Instala dependencias y arranca en local:

```bash
npm install
npm run dev
```

Despliegue:
- Conecta el repo a Vercel.
- Añade las variables de entorno en Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

Pasos siguientes: añadir autenticación, esquema de tablas en Supabase (teams, matches, picks), y motor de scoring.
