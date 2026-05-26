# Deploy to Vercel

## Option 1: Deploy via Vercel CLI (Recommended)

### Install Vercel CLI
```bash
npm i -g vercel
```

### Deploy
```bash
cd /root/.openclaw/workspace/cryptotamagotchi/frontend

# Login (buka browser untuk auth)
vercel login

# Deploy
vercel --prod
```

## Option 2: Deploy via GitHub Integration

1. Buka https://vercel.com/new
2. Import GitHub repo: `oktavian3/cryptotamagotchi`
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Deploy

## Option 3: Manual Upload

1. Build locally:
```bash
cd frontend
npm install
npm run build
```

2. Upload `dist/` folder ke Vercel:
   - Buka https://vercel.com/new
   - Pilih "Import Git Repository" atau drag-drop folder

## Environment Variables (if needed)

Tambahkan di Vercel dashboard:
- `VITE_CONTRACT_ADDRESS`: `0x63A26225eD64DF9A92D276Edfc6d7F2234C91F3e`

## Custom Domain (Optional)

1. Di Vercel dashboard → Project Settings → Domains
2. Add domain: `cryptotamagotchi.vercel.app` (auto) atau custom domain

---

**Hasil deploy akan dapat URL seperti:** `https://cryptotamagotchi-xxx.vercel.app`
