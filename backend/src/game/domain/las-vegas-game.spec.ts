import { clampRounds, LasVegasGame, settleCasino } from './las-vegas-game';

function total(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}

describe('settleCasino', () => {
  it('drops tied counts and pays the rest from the highest bill down', () => {
    const result = settleCasino(
      [20_000, 60_000, 10_000],
      [
        [0, 3],
        [1, 3],
        [2, 1],
        [3, 2],
      ],
    );

    expect(result).toEqual([
      { player: 3, bill: 60_000 },
      { player: 2, bill: 20_000 },
    ]);
  });

  it('pays nothing when no dice were placed', () => {
    expect(settleCasino([50_000], [[0, 0]])).toEqual([]);
  });
});

describe('clampRounds', () => {
  it('keeps the round count within 1 to 10 and defaults to 4', () => {
    expect(clampRounds(0)).toBe(1);
    expect(clampRounds(99)).toBe(10);
    expect(clampRounds('6')).toBe(6);
    expect(clampRounds(undefined)).toBe(4);
  });
});

describe('LasVegasGame', () => {
  it('rejects unsupported player or round counts', () => {
    expect(() => new LasVegasGame(1)).toThrow();
    expect(() => new LasVegasGame(6)).toThrow();
    expect(() => new LasVegasGame(2, 0)).toThrow();
    expect(() => new LasVegasGame(2, 11)).toThrow();
  });

  it('deals at least $50,000 to every casino and 8 dice to every player', () => {
    const { casinos, players } = new LasVegasGame(4).getState();

    for (const casino of casinos) {
      expect(total(casino.bills)).toBeGreaterThanOrEqual(50_000);
    }
    expect(players.map((p) => p.diceLeft)).toEqual([8, 8, 8, 8]);
  });

  it('places every die showing the chosen value', () => {
    const game = new LasVegasGame(2);
    game.roll();
    const { roll } = game.getState();
    const value = roll[0];
    const count = roll.filter((v) => v === value).length;

    game.place(value);

    const state = game.getState();
    expect(roll).toHaveLength(8);
    expect(state.casinos[value - 1].dice[0]).toBe(count);
    expect(state.players[0].diceLeft).toBe(8 - count);
    expect(state.currentPlayer).toBe(1);
    expect(state.roll).toBeNull();
  });

  it('rejects placing before rolling, rolling twice, or a value not rolled', () => {
    const game = new LasVegasGame(2);

    expect(() => game.place(1)).toThrow();
    game.roll();
    expect(() => game.roll()).toThrow();
    expect(() => game.place(7)).toThrow();
  });

  it('plays the chosen number of rounds, rotating the start player', () => {
    const game = new LasVegasGame(3, 5);
    const startPlayers: number[] = [];
    let paid = 0;
    let seenRound = 0;

    while (!game.getState().isFinished) {
      const state = game.getState();
      if (state.round !== seenRound) {
        startPlayers.push(state.startPlayer);
        seenRound = state.round;
      }
      game.roll();
      game.place(game.getState().roll[0]);

      const { lastRound } = game.getState();
      if (lastRound && lastRound.round === seenRound) {
        paid += total(lastRound.payouts.map((p) => p.bill));
        seenRound = -1;
      }
    }

    const final = game.getState();
    expect(final.totalRounds).toBe(5);
    expect(startPlayers).toEqual([0, 1, 2, 0, 1]);
    expect(final.lastRound.round).toBe(5);
    expect(total(final.players.map((p) => p.money))).toBe(paid);
    expect(final.winners.length).toBeGreaterThan(0);
    expect(() => game.roll()).toThrow();
  });
});
