import React from 'react';

interface TermsOfServiceProps {
  onBack?: () => void;
  isModal?: boolean;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack, isModal = false }) => {
  const containerClasses = isModal ? '' : 'min-h-screen';
  const contentPadding = isModal ? 'px-6 py-6' : 'px-8 py-12';

  return (
    <div className={containerClasses} style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {!isModal && (
        <header className="border-b" style={{ borderColor: 'var(--border)' }}>
          <nav className="max-w-[1152px] mx-auto px-8 py-6 flex items-center justify-between">
            {onBack && (
              <button
                onClick={onBack}
                className="text-base hover:opacity-70 transition-opacity"
                style={{ color: 'var(--muted-foreground)' }}
              >
                ← 返回
              </button>
            )}
          </nav>
        </header>
      )}

      {/* Content */}
      <main className={`max-w-[896px] mx-auto ${contentPadding}`}>
        <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>用户协议</h1>
        
        <p className="mb-8" style={{ color: 'var(--muted-foreground)' }}>
          <strong>最后更新日期：</strong>2025年12月1日
        </p>

        <p className="mb-8" style={{ color: 'var(--foreground)' }}>
          <strong>欢迎您使用广州灵猴工坊创意科技有限公司（以下简称"我们"或"本公司"）提供的服务！</strong>
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>1. 协议的范围</h2>
          <p className="mb-4" style={{ color: 'var(--foreground)' }}>
            1.1 本协议是您与本公司之间就使用我们提供的网站及相关服务（以下简称"本服务"）所订立的协议。
          </p>
          <p className="mb-4" style={{ color: 'var(--foreground)' }}>
            1.2 您在使用本服务前，应当仔细阅读本协议。<strong>当您完成注册程序、点击'同意'或类似选项时，即表示您已充分阅读、理解并接受本协议的全部内容。</strong>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>2. 账号注册与安全</h2>
          <p className="mb-4" style={{ color: 'var(--foreground)' }}>
            2.1 您在使用本服务时可能需要注册一个账号。您承诺您提供的<strong>手机号码等注册信息是真实、准确、完整</strong>的，并有义务保持信息的更新。
          </p>
          <p className="mb-4" style={{ color: 'var(--foreground)' }}>
            2.2 您有责任妥善保管您的账号及密码，并对此账号下发生的一切活动承担责任。如您发现任何未经授权的账号使用行为，应立即通知我们。我们将协助您采取措施，并依据适用法律确定各方的责任。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>3. 用户行为规范</h2>
          <p className="mb-4" style={{ color: 'var(--foreground)' }}>
            您承诺不会利用本服务进行任何违法、侵权或损害他人利益的行为，包括但不限于：
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2" style={{ color: 'var(--foreground)' }}>
            <li>违反中华人民共和国法律法规的行为；</li>
            <li>侵犯他人知识产权、商业秘密等合法权益；</li>
            <li>发布任何虚假、骚扰性、侮辱、诽谤、恐吓或庸俗淫秽的信息；</li>
            <li>从事任何可能干扰、破坏网络服务正常运行的行为。</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>4. 服务的变更、中断或终止</h2>
          <p className="mb-4" style={{ color: 'var(--foreground)' }}>
            4.1 为保障服务的质量和安全，我们可能视情况对服务内容、功能等进行调整、中断。如发生重大调整或中断，我们将尽可能提前通知您。如因不可抗力等原因导致服务终止，我们将向用户进行公告。
          </p>
          <p className="mb-4" style={{ color: 'var(--foreground)' }}>
            4.2 如您严重违反本协议规定，在向我们发出纠正通知后的合理期限内仍未更正的，我们有权中止或终止向您提供本服务。法律法规另有规定的除外。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>5. 免责声明</h2>
          <p className="mb-4" style={{ color: 'var(--foreground)' }}>
            5.1 我们将尽力维护服务的稳定性和安全性，但您理解并同意，互联网服务不可避免地会受各种因素影响，我们无法对服务的连续性、无差错性作绝对担保。
          </p>
          <p className="mb-4" style={{ color: 'var(--foreground)' }}>
            5.2 对于因不可抗力（如地震、洪水、战争等）、第三方（如电信运营商）故障或政府行为导致的服务中断、数据丢失等情况，我们在法律允许的范围内免除责任。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>6. 法律适用与管辖</h2>
          <p className="mb-4" style={{ color: 'var(--foreground)' }}>
            本协议的订立、执行和解释及争议的解决均适用中华人民共和国法律。如双方就本协议内容发生争议，应友好协商解决；协商不成的，任何一方均可向本公司所在地有管辖权的人民法院提起诉讼。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>7. 其他</h2>
          <p className="mb-4" style={{ color: 'var(--foreground)' }}>
            7.1 我们有权根据需要不时地修改本协议。如发生重大变更，我们将通过网站公告、站内通知等合理方式提前通知您。若您不同意修改后的协议，您有权停止使用本服务。若您在通知后继续使用本服务，则视为接受修改后的协议。
          </p>
          <p className="mb-4" style={{ color: 'var(--foreground)' }}>
            7.2 如果您对本协议有任何问题，请通过以下方式联系我们：<strong>support@vocoapp.co</strong>
          </p>
        </section>

        <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
          <p>广州灵猴工坊创意科技有限公司</p>
          <p>粤ICP备2025490615号</p>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;

