export const ko = {
  title: '요트 다이스',
  setup: {
    heading: '요트 다이스',
    subtitle: '2인용 클래식 주사위 게임',
    player1Label: '플레이어 1 이름',
    player2Label: '플레이어 2 이름',
    player1Placeholder: '플레이어 1',
    player2Placeholder: '플레이어 2',
    startButton: '게임 시작',
  },
  game: {
    turn: (name: string) => `${name}의 차례`,
    rollsLeft: (n: number) => `남은 굴림: ${n}회`,
    rollButton: '주사위 굴리기',
    mustScore: '점수를 선택해주세요',
    selectCategory: '점수를 등록할 카테고리를 선택하세요',
    round: (scored: number) => `${scored} / 12 카테고리 완료`,
  },
  categories: {
    aces: '에이스 (1)',
    deuces: '듀스 (2)',
    threes: '쓰리 (3)',
    fours: '포 (4)',
    fives: '파이브 (5)',
    sixes: '식스 (6)',
    bonus: '보너스',
    choice: '초이스',
    fourOfKind: '포카인드',
    fullHouse: '풀하우스',
    smallStraight: '스몰 스트레이트',
    largeStraight: '라지 스트레이트',
    yacht: '요트',
  },
  scoreSheet: {
    upper: '상단',
    lower: '하단',
    bonusNote: '63점 이상이면 +35점',
    total: '합계',
  },
  result: {
    winner: (name: string) => `🏆 ${name} 승리!`,
    tie: '무승부!',
    score: (name: string, score: number) => `${name}: ${score}점`,
    playAgain: '다시 시작',
  },
  errors: {
    serverError: '서버 오류가 발생했습니다. 다시 시도해주세요.',
  },
};

export type I18n = typeof ko;
