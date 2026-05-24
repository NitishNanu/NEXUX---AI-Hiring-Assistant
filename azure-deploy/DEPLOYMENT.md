# AI Hiring Assistant — Azure Deployment Guide

## Prerequisites
- Azure CLI installed (`az --version`)
- Azure subscription active
- Docker installed (for container deployment)

## Option 1: Azure App Service (Container)

```bash
# 1. Login to Azure
az login

# 2. Create resource group
az group create --name ai-hiring-rg --location eastus

# 3. Create Azure Container Registry
az acr create --name aihiringacr --resource-group ai-hiring-rg --sku Basic

# 4. Build and push Docker image
az acr build --registry aihiringacr --image ai-hiring-assistant:latest .

# 5. Create App Service Plan
az appservice plan create \
  --name ai-hiring-plan \
  --resource-group ai-hiring-rg \
  --sku B1 \
  --is-linux

# 6. Create Web App
az webapp create \
  --name ai-hiring-assistant \
  --resource-group ai-hiring-rg \
  --plan ai-hiring-plan \
  --deployment-container-image-name aihiringacr.azurecr.io/ai-hiring-assistant:latest

# 7. Configure environment variables
az webapp config appsettings set \
  --name ai-hiring-assistant \
  --resource-group ai-hiring-rg \
  --settings \
    AZURE_OPENAI_API_KEY="your-key" \
    AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com/" \
    AZURE_OPENAI_DEPLOYMENT="gpt-5.4-2026-03-05" \
    AZURE_OPENAI_EMBEDDING_DEPLOYMENT="text-embedding-ada-002"

# 8. Enable container logging
az webapp log config \
  --name ai-hiring-assistant \
  --resource-group ai-hiring-rg \
  --docker-container-logging filesystem
```

## Option 2: Azure App Service (Code)

```bash
# Deploy directly from code
az webapp up \
  --name ai-hiring-assistant \
  --resource-group ai-hiring-rg \
  --runtime "PYTHON:3.11" \
  --sku B1
```

## Azure OpenAI Setup

```bash
# Create Azure OpenAI resource
az cognitiveservices account create \
  --name ai-hiring-openai \
  --resource-group ai-hiring-rg \
  --kind OpenAI \
  --sku S0 \
  --location eastus

# Deploy GPT-5.4 model
az cognitiveservices account deployment create \
  --name ai-hiring-openai \
  --resource-group ai-hiring-rg \
  --deployment-name gpt-5.4-2026-03-05 \
  --model-name gpt-5.4 \
  --model-version "2026-03-05" \
  --model-format OpenAI \
  --sku-name Standard \
  --sku-capacity 10

# Deploy Embedding model
az cognitiveservices account deployment create \
  --name ai-hiring-openai \
  --resource-group ai-hiring-rg \
  --deployment-name text-embedding-ada-002 \
  --model-name text-embedding-ada-002 \
  --model-version "2" \
  --model-format OpenAI \
  --sku-name Standard \
  --sku-capacity 10
```

## Verify Deployment

```bash
# Check app status
az webapp show --name ai-hiring-assistant --resource-group ai-hiring-rg --query state

# View logs
az webapp log tail --name ai-hiring-assistant --resource-group ai-hiring-rg

# Open in browser
az webapp browse --name ai-hiring-assistant --resource-group ai-hiring-rg
```
