"""LoRA Fine-Tuning Manager — scaffold for HR-specific model fine-tuning."""

import json
import os

# ── Sample training data ─────────────────────────────────────────────
SAMPLE_TRAINING_DATA = [
    {
        "instruction": "Review this resume summary and provide feedback.",
        "input": "Experienced software developer with 5 years in Python and JavaScript. Built web apps using React and Node.js.",
        "output": "Your summary is concise but could be stronger. Consider: 1) Adding quantifiable achievements (e.g., 'Built web apps serving 10K+ users'). 2) Specifying your strongest domain (fintech, healthtech, etc.). 3) Including leadership or mentorship experience if applicable. 4) Mentioning your most impactful project outcome.",
    },
    {
        "instruction": "What skills should a data scientist add to their resume?",
        "input": "Current skills: Python, SQL, Excel, Tableau",
        "output": "To strengthen your data science profile, consider adding: **Core ML:** scikit-learn, TensorFlow/PyTorch, statistical modeling. **Data Engineering:** Spark, Airflow, cloud platforms (AWS/GCP/Azure). **Advanced Analytics:** A/B testing, NLP, time series analysis. **Tools:** Git, Docker, Jupyter, MLflow. **Soft Skills:** stakeholder communication, data storytelling. Prioritize based on your target role — ML Engineer roles value PyTorch/TensorFlow, while Analytics roles value SQL optimization and Tableau.",
    },
    {
        "instruction": "Generate behavioral interview questions for a project manager.",
        "input": "Senior PM role at a tech company, 8+ years experience required",
        "output": "1. **Stakeholder Management:** Tell me about a time you managed conflicting priorities from different stakeholders. How did you align them? 2. **Risk Mitigation:** Describe a project where a major risk materialized. What was your contingency plan? 3. **Team Leadership:** Give an example of how you motivated an underperforming team member. 4. **Scope Management:** How did you handle scope creep on a critical project? 5. **Agile Delivery:** Describe your experience transitioning a team from waterfall to agile methodology.",
    },
    {
        "instruction": "Compare these two candidates for a frontend developer role.",
        "input": "Candidate A: 3 years React, no TypeScript. Candidate B: 2 years Vue, knows TypeScript.",
        "output": "**Assessment:** Both are viable, but the choice depends on your tech stack. If your team uses React: **Candidate A** has more relevant experience but lacks TypeScript (a gap that's increasingly important). If your team values type safety: **Candidate B** brings TypeScript skills that transfer across frameworks, and Vue-to-React transition is manageable (2-4 weeks ramp-up). **Recommendation:** If the role requires immediate productivity, choose A with a TypeScript upskilling plan. For long-term investment, B may be stronger due to type-safety mindset.",
    },
    {
        "instruction": "What makes an ATS-friendly resume?",
        "input": "",
        "output": "**ATS Optimization Checklist:** 1. **Format:** Use standard sections (Experience, Education, Skills). Avoid tables, columns, headers/footers, and images. 2. **Keywords:** Mirror exact phrases from the job description. If they say 'project management,' don't just say 'managed projects.' 3. **File Format:** PDF is safest; some older ATS prefer .docx. 4. **Fonts:** Stick to standard fonts (Arial, Calibri, Times). 5. **Dates:** Use consistent format (MM/YYYY). 6. **Skills Section:** List technical skills explicitly — don't bury them in descriptions. 7. **Avoid:** Graphics, icons, special characters, multi-column layouts.",
    },
]


def get_training_data() -> list[dict]:
    """Return sample LoRA training data."""
    return SAMPLE_TRAINING_DATA


def save_training_data(output_path: str = "./data/lora_training/hr_training.jsonl"):
    """Save training data in JSONL format for LoRA fine-tuning."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        for item in SAMPLE_TRAINING_DATA:
            f.write(json.dumps(item) + "\n")
    return output_path


def get_lora_config() -> dict:
    """Return recommended LoRA configuration for HR fine-tuning."""
    return {
        "model_name": "meta-llama/Llama-2-7b-hf",
        "peft_config": {
            "r": 16,
            "lora_alpha": 32,
            "lora_dropout": 0.05,
            "target_modules": ["q_proj", "v_proj"],
            "task_type": "CAUSAL_LM",
        },
        "training_args": {
            "num_train_epochs": 3,
            "per_device_train_batch_size": 4,
            "learning_rate": 2e-4,
            "warmup_steps": 100,
            "logging_steps": 10,
            "save_steps": 200,
            "fp16": True,
        },
        "notes": [
            "Requires GPU with at least 16GB VRAM for 7B model",
            "Training takes approximately 30-60 minutes on A100",
            "Use the training data from data/lora_training/hr_training.jsonl",
            "After training, the adapter will be saved to data/lora_adapter/",
        ],
    }


def get_training_script() -> str:
    """Return a ready-to-run LoRA training script."""
    return '''"""
LoRA Fine-Tuning Script for HR Assistant
Run on a machine with GPU: python train_lora.py
"""

import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling,
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training

# --- Config ---
MODEL_NAME = "meta-llama/Llama-2-7b-hf"
TRAINING_DATA = "./data/lora_training/hr_training.jsonl"
OUTPUT_DIR = "./data/lora_adapter"

# --- Load model ---
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
tokenizer.pad_token = tokenizer.eos_token

model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float16,
    device_map="auto",
    load_in_8bit=True,
)
model = prepare_model_for_kbit_training(model)

# --- LoRA config ---
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    target_modules=["q_proj", "v_proj"],
    task_type="CAUSAL_LM",
)
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()

# --- Load data ---
dataset = load_dataset("json", data_files=TRAINING_DATA, split="train")

def tokenize(example):
    text = f"### Instruction:\\n{example[\'instruction\']}\\n\\n"
    if example.get("input"):
        text += f"### Input:\\n{example[\'input\']}\\n\\n"
    text += f"### Response:\\n{example[\'output\']}"
    return tokenizer(text, truncation=True, max_length=512, padding="max_length")

dataset = dataset.map(tokenize, remove_columns=dataset.column_names)

# --- Training ---
training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    num_train_epochs=3,
    per_device_train_batch_size=4,
    learning_rate=2e-4,
    warmup_steps=100,
    logging_steps=10,
    save_steps=200,
    fp16=True,
    report_to="none",
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset,
    data_collator=DataCollatorForLanguageModeling(tokenizer, mlm=False),
)

trainer.train()
model.save_pretrained(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)
print(f"✅ LoRA adapter saved to {OUTPUT_DIR}")
'''


def compare_models() -> dict:
    """Return a comparison framework for base vs fine-tuned model."""
    return {
        "comparison_metrics": [
            "Response relevance to HR domain",
            "Specificity of resume feedback",
            "Quality of interview questions",
            "Accuracy of skill gap analysis",
            "Professional tone consistency",
        ],
        "test_prompts": [
            "Review this resume for a senior software engineer position.",
            "What skills should I develop for a data science career?",
            "Generate interview questions for a product manager role.",
            "How should I format my resume for ATS systems?",
            "Compare two candidates for a machine learning position.",
        ],
        "evaluation_method": "Side-by-side comparison with human evaluation on a 1-5 scale",
        "expected_improvement": "15-30% improvement in domain-specific response quality",
    }
