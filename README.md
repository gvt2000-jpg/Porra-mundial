# Porras Mundial

Proyecto mÃ­nimo para gestionar porras del Mundial usando Next.js y Supabase.

Setup rÃ¡pido:

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
- AÃ±ade las variables de entorno en Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

Pasos siguientes: aÃ±adir autenticaciÃ³n, esquema de tablas en Supabase (teams, matches, picks), y motor de scoring.
