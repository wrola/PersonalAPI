export class OutputConversationDto {
  constructor(
    private answer: { content: string },
    private conversationId: string,
  ) {}
}
