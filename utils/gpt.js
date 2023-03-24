const openAIKey = process.env.OPEN_AI_API_KEY;

export async function summarize(url) {

  try {

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIKey}`
      },
      body: JSON.stringify({
        "model": "gpt-3.5-turbo",
        "messages": [{ "role": "system", "content": `Create a summary for the content in this URL in less than 50 words: ${url}` }]
      })
    });

    const json = await response.json();
    return json.choices[0].message.content;
  } catch (e) {
    console.log('error while summarizing', e);
    return ''
  }
}