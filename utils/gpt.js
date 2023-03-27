const openAIKey = process.env.OPEN_AI_API_KEY;
const prompt = `Breakdown this article in a TLDR style format with 300 characters maximum. Explain it as a statement. Don't start the response with "This article is" : `;

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
        "messages": [{ "role": "system", "content": `${prompt} ${url}` }]
      })
    });

    const json = await response.json();
    return json.choices[0].message.content;
  } catch (e) {
    console.log('error while summarizing', e);
    return ''
  }
}

const systemPrompt = 'You are an assistant with the name asd9bot. Your task is to help developers with their queries related to their programming careers. Feel free to deny responding to any other queries that seem personal in nature and that do not match your purpose which is to help developers. Limit the response to  1000 characters strictly irrespective of the request. Include code examples wherever necessary.';
export async function chat(userPrompt) {
  try {

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIKey}`
      },
      body: JSON.stringify({
        "model": "gpt-3.5-turbo",
        "messages": [{ "role": "system", "content": systemPrompt }, { "role": "user", "content": userPrompt }]
      })
    });

    const json = await response.json();
    return json.choices[0].message.content;
  } catch (e) {
    console.log('error while chatting with asd9', e);
    return 'ASD9 is sleeping right now. Please try again later.'
  }
}
