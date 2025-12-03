using System.Collections.Generic;

namespace Mathsino.Backend.Models;

public record AnalyzeMoveRequest(
    List<CardDto> PlayerHandCards, 
    CardDto DealerCard, 
    string Action, 
    bool CanSplit,
    bool CanDouble
);

public record CardDto(string Rank, string Suit);

public record AnalysisResult(bool IsCorrect, string CorrectMove, string Message);