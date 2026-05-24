"""LoRA management router — training data, config, and comparison endpoints."""

from fastapi import APIRouter

from backend.services.lora_manager import (
    get_training_data,
    get_lora_config,
    get_training_script,
    compare_models,
    save_training_data,
)

router = APIRouter(prefix="/api/lora", tags=["LoRA Fine-Tuning"])


@router.get("/training_data")
async def training_data():
    """Get sample LoRA training data for HR fine-tuning."""
    return {"data": get_training_data(), "count": len(get_training_data())}


@router.get("/config")
async def lora_config():
    """Get recommended LoRA configuration."""
    return get_lora_config()


@router.get("/training_script")
async def training_script():
    """Get the ready-to-run LoRA training script."""
    return {"script": get_training_script()}


@router.get("/compare")
async def compare():
    """Get comparison framework for base vs fine-tuned model."""
    return compare_models()


@router.post("/export_training_data")
async def export_training_data():
    """Export training data to JSONL file."""
    path = save_training_data()
    return {"message": f"Training data exported to {path}", "path": path}
