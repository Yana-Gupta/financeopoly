const OPENAI_API_KEY = "106bf79dfc2341398b085ff3425d3eab";

const showHumanPlayerPrompt = async (player, property) => {
    const prompt = `
      You landed on ${property.name}. 
      Price: $${property.price}.
      Your Balance: $${player.balance}.
      Owned Properties: ${player.properties.length}.
      Net Worth: $${player.balance + player.properties.reduce((acc, p) => acc + p.price, 0)}.
  
      Do you want to buy this property?
    `;

    return confirm(prompt);
}
const AIPLayerAction = async (currentPlayer, currentProperty, players) => {
    let opponentDetails = players.map((player, index) => {
        if (player === currentPlayer) {
            return ` `;
        } else {
            return `${index + 1} ${player.balance} & ${player.properties.join(", ")}`;
        }
    }).join(". ");

    opponentDetails = "Monopoly game opponent balance and assets" 

    const truncatedOpponentDetails = opponentDetails.length > 200
        ? opponentDetails.slice(0, 200) + "..."
        : opponentDetails;

    const prompt = `
${truncatedOpponentDetails}.
Our player at ${currentPlayer.position} & balance ${currentPlayer.balance}.
Please respond with one action, one word:
- "buy ${currentProperty.name} at ${currentProperty.price}" what's your pick,
- "skip" if the AI decides to skip,`;

    // Truncate the prompt if necessary
    const truncatedPrompt = prompt.length > 256
        ? prompt.slice(0, 240) + "..."
        : prompt;

    const response = await fetch("https://api.aimlapi.com/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo",
            messages: [
                { "role": "user", "content": truncatedPrompt }
            ],
            max_tokens: 50,
            temperature: 0.7,
        })
    });

    const data = await response.json();

    console.log(data.choices[0].message.content);
    return data.choices[0].message.content;
};

export { AIPLayerAction, showHumanPlayerPrompt };
