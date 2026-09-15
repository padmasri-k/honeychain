import google.generativeai as genai
from config import GOOGLE_API_KEY

# Configure Gemini
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)


def _get_model():
    """Get the Gemini model instance."""
    return genai.GenerativeModel("gemini-2.0-flash")


async def analyze_honey_quality(params: dict) -> str:
    """
    Analyze honey quality based on lab parameters.
    params: moisture_pct, hmf_level, color, diastase_number, sugar_content, etc.
    """
    prompt = f"""You are a honey quality expert. Analyze the following honey lab test results and provide:
1. Overall quality grade (A+, A, B, C, or Fail)
2. Purity assessment (Pure / Likely Adulterated / Suspicious)
3. Detailed analysis of each parameter
4. Recommendations for improvement
5. Compliance with FSSAI (Food Safety and Standards Authority of India) standards

Lab Results:
{_format_params(params)}

Provide a structured, detailed response with clear sections. Use markdown formatting."""

    try:
        model = _get_model()
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"AI analysis unavailable: {str(e)}. Please ensure GOOGLE_API_KEY is configured."


async def diagnose_bee_disease(symptoms: str, hive_info: dict = None) -> str:
    """
    Diagnose potential bee diseases based on symptoms description.
    """
    context = ""
    if hive_info:
        context = f"\nHive Information:\n- Species: {hive_info.get('bee_species', 'Unknown')}\n- Location: {hive_info.get('location', 'Unknown')}\n- Colony Strength: {hive_info.get('colony_strength', 'Unknown')}\n"

    prompt = f"""You are an expert apiarist and bee disease specialist. Based on the following symptoms, provide:
1. Most likely diagnosis (top 3 possibilities with confidence percentage)
2. Detailed description of each potential disease
3. Immediate action steps
4. Recommended treatment plan
5. Prevention measures for the future
6. When to consult a veterinary entomologist
{context}
Reported Symptoms:
{symptoms}

Provide a structured, actionable response using markdown formatting. Include specific product names or treatments available in India when possible."""

    try:
        model = _get_model()
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"AI diagnosis unavailable: {str(e)}. Please ensure GOOGLE_API_KEY is configured."


async def predict_yield(hive_data: dict) -> str:
    """
    Predict honey yield based on hive data and environmental factors.
    """
    prompt = f"""You are a smart beekeeping AI assistant. Based on the following hive and environmental data, predict:
1. Expected honey yield (in kg) for the next harvest cycle
2. Optimal harvest timing
3. Factors that could increase/decrease yield
4. Seasonal recommendations
5. Flora management suggestions

Hive Data:
{_format_params(hive_data)}

Provide specific, data-driven predictions with confidence ranges. Use markdown formatting."""

    try:
        model = _get_model()
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"AI prediction unavailable: {str(e)}. Please ensure GOOGLE_API_KEY is configured."


async def chat(message: str, context: str = "") -> str:
    """
    General beekeeping Q&A chatbot.
    """
    system_context = """You are HoneyChain AI, an expert beekeeping assistant built into the HoneyChain platform. 
You specialize in:
- Beekeeping best practices in India
- Honey quality and purity assessment
- Bee disease identification and treatment
- Supply chain management for honey
- FSSAI regulations for honey
- Sustainable apiculture

Provide helpful, accurate, and concise responses. Use markdown formatting.
When discussing treatments or chemicals, mention Indian brand names when possible.
Always prioritize bee welfare and sustainable practices."""

    full_prompt = f"{system_context}\n\n"
    if context:
        full_prompt += f"Context: {context}\n\n"
    full_prompt += f"User Question: {message}"

    try:
        model = _get_model()
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        return f"AI chat unavailable: {str(e)}. Please ensure GOOGLE_API_KEY is configured."


async def get_market_insights(variety: str, region: str = "India") -> str:
    """
    Get market price insights for honey variety.
    """
    prompt = f"""You are a honey market analyst. Provide market insights for:
- Honey Variety: {variety}
- Region: {region}

Include:
1. Current estimated price range (per kg in INR)
2. Price trends (last 6 months)
3. Demand factors
4. Best selling channels (online, wholesale, retail)
5. Value-addition opportunities (e.g., infused honey, comb honey)
6. Export potential

Use markdown formatting with tables where appropriate."""

    try:
        model = _get_model()
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"AI market insights unavailable: {str(e)}. Please ensure GOOGLE_API_KEY is configured."


def _format_params(params: dict) -> str:
    """Format parameters dict into a readable string."""
    return "\n".join(f"- {key}: {value}" for key, value in params.items())
