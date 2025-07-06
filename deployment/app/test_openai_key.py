import openai
import asyncio

# Your OpenAI API key
api_key = "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"

client = openai.AsyncOpenAI(api_key=api_key)

async def test():
    try:
        response = await client.chat.completions.create(
            model="gpt-4",
            max_tokens=100,
            messages=[{"role": "user", "content": "What is the ADA?"}]
        )
        print("Success:", response.choices[0].message.content)
    except Exception as e:
        print("OpenAI error:", e)

asyncio.run(test())