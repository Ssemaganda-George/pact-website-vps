# SSH Setup Instructions for GitHub Actions Deployment

## Step 1: Get Your Private Key

On Windows, run this command to view your private key:
```powershell
type "%USERPROFILE%\.ssh\pact_site_key"
```

Copy the entire output (including `-----BEGIN` and `-----END` lines).

## Step 2: Add Public Key to VPS

SSH into your VPS server:
```bash
ssh root@138.68.104.122
```

Then run these commands on the VPS:
```bash
# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add your public key to authorized_keys
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDEEL4Q46b+BAABSnfrZ3r1Y+qzE9chcWAKqYhQBhRDK8reo5cp3e+0XlM7pYG0DNpSgryOZet6UL/r769kfXzyJpZoleMssFjqW1EpyOAydWzM5grmS5DLrd/5AsKMWsoNqxVCmS+5hqQC+L4nec27gSaucKwbrzuZBvo/JODz0K2RYVIGl+mTg+DeN4j9W4iZfav8svUyOVT4zkIvIfepfMgcvK+zygIcgTHNzVVfejY3juF/qrUUGf+Dsv3+8plP7VO2T3Dr92A2qtAdSLR2KwA9H1AwUPE8B88mqQus3fEcPQK4uQLtjZWcYM5bV36+IfBSPssLKyeUzpCFzPEvrHkoaTa7DlFoKJIO7tNwXwEtARg/JUVaTaLP5KJl+u05/Mv1QVmAMtzGvyo085QmfFgsUd1fyKKUiwDL4926qmaOqeoZ0fLKdqya/xoSBRPjaFXZgJ3Jy64PJOFe0vK2hmX4sg1X4JaXF9q8ljMcB16YV+gwYcKC+Yat/yWxSfSL+zsC6WyzC814fnOc6WAqaV49D/BeSYX3WQX6VbRjNCPn9OxbRAkLAChcvhppZZI3q33bLnlKnycM2OvJeenF9ek+i6vkcOpHX2RK/B0rSjI2bHImd4pls6ZtS9FXR+7KoKQrZD8NUKp/DLOK68A42dJV1HPHAsY+DiHsLX6T1w== vierycalliper@gmail.com" >> ~/.ssh/authorized_keys

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys
```

## Step 3: Add Secrets to GitHub

1. Go to your GitHub repository: https://github.com/Ssemaganda-George/pact-website-vps
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add these secrets:

### SSH_HOST
- Name: `SSH_HOST`
- Value: `138.68.104.122`

### SSH_USER
- Name: `SSH_USER`
- Value: `root` (or your SSH username)

### SSH_PRIVATE_KEY
- Name: `SSH_PRIVATE_KEY`
- Value: (Paste your entire private key from Step 1, including BEGIN and END lines)

### SSH_PORT (Optional)
- Name: `SSH_PORT`
- Value: `22` (default, can skip if using 22)

### REMOTE_PATH (Optional)
- Name: `REMOTE_PATH`
- Value: `/opt/pact-website` (or your preferred path)

## Step 4: Test the Connection

After adding the secrets, push a commit to the `main` branch to trigger the deployment.

## Troubleshooting

If you get "Permission denied" errors:
1. Make sure the public key is correctly added to `~/.ssh/authorized_keys` on the VPS
2. Check file permissions: `chmod 600 ~/.ssh/authorized_keys`
3. Verify the private key in GitHub secrets includes the BEGIN and END lines
4. Test SSH connection manually: `ssh -i ~/.ssh/pact_site_key root@138.68.104.122`

