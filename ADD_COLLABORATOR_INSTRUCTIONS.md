# Instructions to Add Jacob Muimi as GitHub Collaborator

## Method 1: Via GitHub Web Interface (Recommended)

1. **Go to Repository Settings:**
   - Visit: https://github.com/jmsmuigai/Bursary
   - Click on **"Settings"** tab (top right of repository page)

2. **Navigate to Collaborators:**
   - In the left sidebar, click **"Collaborators"** (under "Access")
   - If you don't see this option, you may need to upgrade to a paid plan or use "Manage access"

3. **Add Collaborator:**
   - Click **"Add people"** button
   - Enter email: `Jacobmuimi@gmail.com` or GitHub username if known
   - Select permission level: **"Write"** (allows push access)
   - Click **"Add [username] to this repository"**

4. **Send Invitation:**
   - GitHub will send an email invitation to Jacob
   - Jacob needs to accept the invitation via email or GitHub notification

## Method 2: Via GitHub API (if you have access token)

```bash
curl -X PUT \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/jmsmuigai/Bursary/collaborators/Jacobmuimi \
  -d '{"permission":"push"}'
```

## Method 3: Create a Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` scope
3. Use the token in API calls or GitHub CLI

## Verification

After adding, verify by:
- Checking Collaborators list in repository settings
- Jacob should receive an email invitation
- Jacob can accept at: https://github.com/jmsmuigai/Bursary/invitations

## Repository Access Link

Once added, Jacob can access the repository at:
**https://github.com/jmsmuigai/Bursary**

## Invitation Link (after adding)

GitHub will generate an invitation link that Jacob can use:
**https://github.com/jmsmuigai/Bursary/invitations**

