export const ko = {
  title: '요트 다이스',
  setup: {
    heading: '요트 다이스',
    subtitle: '클래식 주사위 게임',
    playerCountLabel: '인원 수',
    playerNameLabel: (n: number) => `플레이어 ${n} 이름`,
    playerNamePlaceholder: (n: number) => `플레이어 ${n}`,
    startButton: '게임 시작',
  },
  game: {
    turn: (name: string) => `${name}의 차례`,
    rollsLeft: (n: number) => `남은 굴림: ${n}회`,
    rollButton: '주사위 굴리기',
    rerollButton: '다시 굴리기',
    mustScore: '점수를 선택해주세요',
    canScore: '지금 점수를 등록하거나 계속 굴리세요',
    round: (scored: number) => `${scored} / 12 완료`,
  },
  categories: {
    aces: '⚀ 에이스 (1)',
    deuces: '⚁ 듀스 (2)',
    threes: '⚂ 쓰리 (3)',
    fours: '⚃ 포 (4)',
    fives: '⚄ 파이브 (5)',
    sixes: '⚅ 식스 (6)',
    bonus: '★ 보너스',
    choice: '∑ 초이스',
    fourOfKind: '▣ 포카인드',
    fullHouse: '⌂ 풀하우스',
    smallStraight: '↗ 스몰 스트레이트',
    largeStraight: '⬆ 라지 스트레이트',
    yacht: '⛵ 요트',
  },
  scoreSheet: {
    upper: '상단',
    lower: '하단',
    bonusNote: '63점 이상 → +35점',
    subtotal: '상단 소계',
    total: '합계',
    category: '카테고리',
  },
  announcement: {
    nextTurn: (name: string) => `${name}의 차례!`,
  },
  result: {
    winner: (name: string) => `${name} 승리!`,
    winners: (names: string) => `${names} 무승부!`,
    tie: '무승부!',
    score: (name: string, score: number) => `${name}: ${score}점`,
    playAgain: '다시 시작',
    finalScore: '최종 점수판',
  },
  errors: {
    serverError: '서버 오류가 발생했습니다. 다시 시도해주세요.',
  },
};

export type I18n = typeof ko;
