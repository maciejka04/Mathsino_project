using Mathsino.Backend.Game;
import { useTranslation } from 'react-i18next';
namespace Mathsino.Backend.Services;

public static class BlackjackStrategy
{
    public enum Move { Hit, Stand, Double, Split }

    // karty krupiera:
    private static int GetDealerIndex(Card card)
    {
        if (card.Rank == "A") return 9;
        if (int.TryParse(card.Rank, out int val)) return val - 2; 
        return 8; // J, Q, K = 10
    }

    // Tabela Par
    private static readonly Dictionary<string, string> PairsTable = new()
    {
        { "2",  "HPPPPPHHHH" }, { "3",  "HPPPPPHHHH" }, { "4",  "HHHPP HHHHH" },
        { "5",  "DDDDDDDDHH" }, { "6",  "PPPPPHHHHH" }, { "7",  "PPPPPHHHHH" },
        { "8",  "PPPPPPPPPP" }, { "9",  "PPPPSPPS S" }, { "10", "SSSSSSSSSS" },
        { "J",  "SSSSSSSSSS" }, { "Q",  "SSSSSSSSSS" }, { "K",  "SSSSSSSSSS" },
        { "A",  "PPPPPPPPPP" }
    };

    // Tabela z Asem
    private static readonly Dictionary<int, string> SoftTable = new()
    {
        { 13, "HHHDDHHHHH" }, { 14, "HHHDDHHHHH" }, { 15, "HHDDDHHHHH" },
        { 16, "HHDDDHHHHH" }, { 17, "HDDDDHHHHH" }, { 18, "SDDDDSSHHH" }, // A,7
        { 19, "SSSSSSSSSS" }, { 20, "SSSSSSSSSS" }, { 21, "SSSSSSSSSS" }
    };

    // Ostatnia
    private static readonly Dictionary<int, string> HardTable = new()
    {
        { 4,  "HHHHHHHHHH" }, { 5,  "HHHHHHHHHH" }, { 6,  "HHHHHHHHHH" },
        { 7,  "HHHHHHHHHH" }, { 8,  "HHHHHHHHHH" }, { 9,  "HDDDDHHHHH" },
        { 10, "DDDDDDDDHH" }, { 11, "DDDDDDDDDD" }, { 12, "HHSSSHHHHH" },
        { 13, "SSSSSHHHHH" }, { 14, "SSSSSHHHHH" }, { 15, "SSSSSHHHHH" },
        { 16, "SSSSSHHHHH" }, { 17, "SSSSSSSSSS" }, { 18, "SSSSSSSSSS" },
        { 19, "SSSSSSSSSS" }, { 20, "SSSSSSSSSS" }, { 21, "SSSSSSSSSS" } 
    };

    public static (bool IsCorrect, string CorrectMove, string Reasoning) AnalyzeMove(
        List<Card> playerHand, 
        Card dealerUpCard, 
        Move playerAction,
        bool canSplit,
        bool canDouble)
    {
        var optimalMove = GetOptimalMove(playerHand, dealerUpCard, canSplit);

        // 4. OBSŁUGA SYTUACJI NIEMOŻLIWYCH
        if (optimalMove == Move.Double && !canDouble)
        {
            // Wyjątek: Soft 18 (A,7) vs 3-6 -> Tabela mówi Double. Jeśli nie można -> STAND.
            if (IsSoft(playerHand) && GetSoftTotal(playerHand) == 18)
                optimalMove = Move.Stand;
            else
                optimalMove = Move.Hit; // W 99% przypadków brak Double oznacza Hit (np. Hard 11)
        }

        // Jeśli tabela mówi Split, ale nie możemy (np. brak kasy lub to nie para), traktujemy jako Hard Total
        if (optimalMove == Move.Split && !canSplit)
        {
            optimalMove = GetHardMove(GetHardTotal(playerHand), dealerUpCard);
        }

        bool isCorrect = playerAction == optimalMove;
        string moveName = optimalMove.ToString().ToUpper();

        return (isCorrect, moveName, isCorrect ? "Good move!" : $"Bad move! correct move: {moveName}");
    }

    private static Move GetOptimalMove(List<Card> hand, Card dealerCard, bool canSplit)
    {
        int dealerIdx = GetDealerIndex(dealerCard);

        // 1. SPRAWDZANIE PAR (Tylko jeśli mamy 2 karty i są równe)
        if (canSplit && hand.Count == 2 && hand[0].Rank == hand[1].Rank)
        {
            string rankKey = hand[0].Rank;

            if (PairsTable.ContainsKey(rankKey))
                return ParseCode(PairsTable[rankKey][dealerIdx]);
        }

        // 2. SOFT TOTALS
        if (IsSoft(hand))
        {
            int softTotal = GetSoftTotal(hand);
            if (SoftTable.ContainsKey(softTotal))
                return ParseCode(SoftTable[softTotal][dealerIdx]);
            if (softTotal >= 21) return Move.Stand;
        }

        // 3. HARD TOTALS
        return GetHardMove(GetHardTotal(hand), dealerCard);
    }

    private static Move GetHardMove(int total, Card dealerCard)
    {
        int dealerIdx = GetDealerIndex(dealerCard);
        if (total >= 17) return Move.Stand;
        if (total <= 4) return Move.Hit;

        if (HardTable.ContainsKey(total))
            return ParseCode(HardTable[total][dealerIdx]);
        
        return Move.Hit;
    }

    private static Move ParseCode(char code) => code switch
    {
        'H' => Move.Hit, 'S' => Move.Stand, 'D' => Move.Double, 'P' => Move.Split, _ => Move.Hit
    };

    private static bool IsSoft(List<Card> hand)
    {
        if (!hand.Any(c => c.Rank == "A")) return false;
        int sumWithoutAce = hand.Where(c => c.Rank != "A").Sum(c => c.Value);
        return (sumWithoutAce + 11) <= 21;
    }

    private static int GetSoftTotal(List<Card> hand) => 
        hand.Where(c => c.Rank != "A").Sum(c => c.Value) + 11;

    private static int GetHardTotal(List<Card> hand)
    {
        int val = 0;
        int aces = 0;
        foreach(var c in hand) { if (c.Rank == "A") aces++; else val += c.Value; }
        for(int i=0; i<aces; i++) val += 1; // As jako 1
        return val; 
    }
}