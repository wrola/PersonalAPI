export const learnSchema = {
  name: 'memorize',
  description:
    "This is a skill that allows me to memorize things and I'll choose it if I want to memorize something.",
  parameters: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description:
          "Ultra-concise name / title for the memory. 1-4 words. It's basically the essence",
      },
      type: {
        type: 'string',
        description: "Always set as 'memory' no matter what.",
      },
      content: {
        type: 'string',
        description: `Carefully written content of the memory based on the user's query. When speaking about himself / herself like "I", "me" or "my", there is a need to change it to the second person ("you"). For example: "I want this" should be "User wants this". At the other hand, the same goes with "you" that refers to the "Alice" so it has to be changed to "I" or "me". For example: "You are very kind" should be "I'm very kind". When necessary, I'll add a date in YYYY-MM-DD HH:mm format at the end of the content.`,
      },
      tags: {
        type: 'array',
        description:
          "Multiple semantic tags/keywords that enriches query for search purposes (similar words, meanings). When query refers to the user, add 'user' tag, and when refers to 'you' add tag 'Alice'",
        items: {
          type: 'string',
        },
      },
      source: {
        type: 'string',
        description:
          'If the user mention a source of the memory (like a website url, book, article, video, etc.) add it here.',
      },
    },
    required: ['name', 'content', 'type'],
  },
};
