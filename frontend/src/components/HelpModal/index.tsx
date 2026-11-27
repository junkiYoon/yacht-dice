import './styles.css';

interface Props {
  onClose: () => void;
}

const UPPER_RULES = [
  { name: '에이스', desc: '1이 나온 주사위의 합', example: '1·1·3·4·6 → 2점' },
  { name: '듀스', desc: '2가 나온 주사위의 합', example: '2·2·2·4·5 → 6점' },
  { name: '쓰리', desc: '3이 나온 주사위의 합', example: '3·3·1·2·5 → 6점' },
  { name: '포', desc: '4가 나온 주사위의 합', example: '4·4·4·2·3 → 12점' },
  { name: '파이브', desc: '5가 나온 주사위의 합', example: '5·5·1·2·3 → 10점' },
  { name: '식스', desc: '6이 나온 주사위의 합', example: '6·6·6·1·2 → 18점' },
];

const LOWER_RULES = [
  {
    name: '초이스',
    desc: '주사위 5개의 합계 (모든 조합 가능)',
    example: '2·3·4·5·6 → 20점',
    score: '합계',
  },
  {
    name: '포카인드',
    desc: '같은 숫자 4개 이상 — 5개 합계',
    example: '4·4·4·4·2 → 18점',
    score: '합계',
  },
  {
    name: '풀하우스',
    desc: '서로 다른 숫자로 3개 + 2개 조합',
    example: '3·3·3·5·5 → 19점',
    score: '합계',
  },
  {
    name: '스몰 스트레이트',
    desc: '4개 연속 숫자 포함',
    example: '2·3·4·5·5 → 15점',
    score: '15점',
  },
  {
    name: '라지 스트레이트',
    desc: '5개 연속 숫자',
    example: '2·3·4·5·6 → 30점',
    score: '30점',
  },
  {
    name: '요트',
    desc: '모두 같은 숫자 (5개)',
    example: '6·6·6·6·6 → 50점',
    score: '50점',
  },
];

export default function HelpModal({ onClose }: Props) {
  return (
    <div className="help-backdrop" onClick={onClose}>
      <div className="help-modal" onClick={(e) => e.stopPropagation()}>
        <div className="help-header">
          <h2 className="help-title">🎲 족보 & 점수 규칙</h2>
          <button className="help-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="help-body">
          {/* Upper section */}
          <section className="help-section">
            <h3 className="help-section-title">상위 섹션</h3>
            <p className="help-section-note">
              합계 <strong>63점 이상</strong>이면 <strong>보너스 +35점</strong>
            </p>
            <div className="help-rules">
              {UPPER_RULES.map((r) => (
                <div key={r.name} className="help-rule">
                  <span className="help-rule-name">{r.name}</span>
                  <span className="help-rule-desc">{r.desc}</span>
                  <span className="help-rule-example">{r.example}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Lower section */}
          <section className="help-section">
            <h3 className="help-section-title">하위 섹션</h3>
            <div className="help-rules">
              {LOWER_RULES.map((r) => (
                <div key={r.name} className="help-rule">
                  <span className="help-rule-name">{r.name}</span>
                  <span className="help-rule-desc">{r.desc}</span>
                  <span className="help-rule-example">{r.example}</span>
                  <span className="help-rule-score">{r.score}</span>
                </div>
              ))}
            </div>
          </section>

          <p className="help-tip">
            💡 조건을 만족 못해도 어떤 칸이든 <strong>0점</strong>으로 등록할 수 있습니다.
            <br />
            한 번 등록한 칸은 변경할 수 없으니 신중하게 선택하세요!
          </p>
        </div>
      </div>
    </div>
  );
}
