import '../HelpModal/styles.css';

interface Props {
  onClose: () => void;
}

const TURN_RULES = [
  { name: '라운드 준비', desc: '카지노 1~6마다 지폐 합계가 $50,000 이상이 될 때까지 지폐를 놓습니다.' },
  { name: '굴리기', desc: '내 차례에는 남은 주사위를 전부 굴립니다.' },
  { name: '걸기', desc: '나온 눈 하나를 골라, 그 눈의 주사위를 전부 같은 번호 카지노에 놓습니다.' },
  { name: '패스', desc: '주사위를 다 쓴 사람은 건너뛰고, 모두 다 쓰면 라운드가 끝납니다.' },
];

const PAYOUT_RULES = [
  { name: '1등', desc: '주사위를 가장 많이 놓은 사람이 가장 큰 지폐를 가져갑니다.' },
  { name: '2등 이하', desc: '그다음으로 많이 놓은 사람부터 다음 지폐를 차례로 가져갑니다.' },
  { name: '동수', desc: '주사위 수가 같은 사람끼리는 모두 정산에서 제외됩니다.' },
];

function RuleList({ rules }: { rules: { name: string; desc: string }[] }) {
  return (
    <div className="help-rules">
      {rules.map((r) => (
        <div key={r.name} className="help-rule">
          <span className="help-rule-name">{r.name}</span>
          <span className="help-rule-desc">{r.desc}</span>
        </div>
      ))}
    </div>
  );
}

export default function LasVegasHelpModal({ onClose }: Props) {
  return (
    <div className="help-backdrop" onClick={onClose}>
      <div className="help-modal" onClick={(e) => e.stopPropagation()}>
        <div className="help-header">
          <h2 className="help-title">🎰 라스베가스 규칙</h2>
          <button className="help-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="help-body">
          <section className="help-section">
            <h3 className="help-section-title">진행</h3>
            <p className="help-section-note">
              각자 자기 색 주사위 <strong>8개</strong>로, 시작할 때 정한 라운드 수만큼 진행합니다.
            </p>
            <RuleList rules={TURN_RULES} />
          </section>

          <section className="help-section">
            <h3 className="help-section-title">정산</h3>
            <RuleList rules={PAYOUT_RULES} />
            <p className="help-tip">
              예) 4번 카지노에 파랑 3 · 초록 3 · 검정 1 · 빨강 2개
              <br />
              → 파랑·초록은 동수로 제외, 빨강이 1등 지폐, 검정이 2등 지폐를 가져갑니다.
            </p>
          </section>

          <p className="help-tip">
            💡 마지막 라운드가 끝나면 <strong>돈을 가장 많이 모은 사람</strong>이 승리합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
