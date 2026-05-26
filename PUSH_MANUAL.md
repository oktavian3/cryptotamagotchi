# Manual Push to GitHub

## Step 1: Generate New Token
1. Buka https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Centang: `repo` (full control)
4. Generate dan copy token

## Step 2: Push dari VPS
```bash
cd /root/.openclaw/workspace/cryptotamagotchi

# Remove old remote
git remote remove origin

# Add dengan token baru (ganti YOUR_TOKEN)
git remote add origin https://YOUR_TOKEN@github.com/oktavian3/cryptotamagotchi.git

# Push
git push -u origin master
```

## Step 3: Verify
Buka https://github.com/oktavian3/cryptotamagotchi

---

## Alternative: Download dan Push dari Local

### Download dari VPS:
```bash
# Di VPS, zip folder
cd /root/.openclaw/workspace
tar -czvf cryptotamagotchi.tar.gz cryptotamagotchi/
```

### Transfer ke local:
- Download via SCP/FTP
- Atau copy paste code

### Push dari local:
```bash
cd cryptotamagotchi
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/oktavian3/cryptotamagotchi.git
git push -u origin master
```
