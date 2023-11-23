export class OutputAnswerDto {
  constructor(private reply: string, private conversationId?: string) {
    this.reply = reply;
    if (conversationId) this.conversationId = conversationId;
  }
}
