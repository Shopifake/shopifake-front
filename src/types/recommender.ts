export type ChatRecommendation = {
  product_id: string;
  name: string;
};

export type ChatHistoryUserEntry = {
  role: "user";
  content: string;
};

export type ChatHistoryRagEntry = {
  role: "rag";
  content: {
    reply: string;
    recommendations: ChatRecommendation[];
  };
};

export type ChatHistoryEntry = ChatHistoryUserEntry | ChatHistoryRagEntry;

export type ChatHistory = ChatHistoryEntry[];

export type RecommenderDecoderSatisfaction = "satisfied" | "unsatisfied" | "need_more_info";

export interface RecommenderChatResponse {
  request_id: string;
  status: "pending" | "complete";
}

export interface RecommenderChatResultPending {
  request_id: string;
  status: "pending";
}

export interface RecommenderChatResultComplete {
  request_id: string;
  status: "complete";
  reply: string;
  decoder_satisfaction: RecommenderDecoderSatisfaction;
  recommendations: ChatRecommendation[];
}

export type RecommenderChatResult = RecommenderChatResultPending | RecommenderChatResultComplete;

