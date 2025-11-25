import React from 'react';

interface PrivacyPolicyProps {
  onBack?: () => void;
  isModal?: boolean;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack, isModal = false }) => {
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
        <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>隐私政策</h1>
        
        <p className="mb-8" style={{ color: 'var(--muted-foreground)' }}>
          <strong>最后更新日期：</strong>2025年12月1日
        </p>

        <p className="mb-8" style={{ color: 'var(--foreground)' }}>
          <strong>广州灵猴工坊创意科技有限公司（以下简称"我们"或"本公司"）深知个人信息对您的重要性，并会尽全力保护您的个人信息安全可靠。</strong>我们致力于维持您对我们的信任，恪守以下原则，保护您的个人信息：权责一致原则、目的明确原则、选择同意原则、最少够用原则、确保安全原则、主体参与原则、公开透明原则。
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>1. 我们如何收集和使用您的个人信息</h2>
          <p className="mb-4" style={{ color: 'var(--foreground)' }}>
            <strong>1.1 账号注册：</strong>当您注册本服务账号时，我们会收集您的手机号码，用于创建账号、发送验证码以完成身份验证，并与您进行必要的业务沟通。如果您拒绝提供手机号码，您将无法完成账号注册，也无法使用需要账号登录后才能使用的服务。
          </p>
          <p className="mb-4" style={{ color: 'var(--foreground)' }}>
            <strong>1.2 设备信息：</strong>当您使用本服务时，我们可能会根据您在访问和/或使用中的具体操作，接收并记录您所使用的设备相关信息（包括设备型号、操作系统版本、唯一设备标识符等）和网络日志信息（包括IP地址、浏览器的类型、访问的日期和时间等），以保障服务的安全运行。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>2. 我们如何共享、转让、公开披露您的个人信息</h2>
          <p className="mb-4" style={{ color: 'var(--foreground)' }}>
            <strong>2.1 我们不会与任何公司、组织和个人共享您的个人信息</strong>，但以下情况除外：
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2" style={{ color: 'var(--foreground)' }}>
            <li>事先获得您明确的同意或授权；</li>
            <li>根据适用的法律法规、法律程序的要求、强制性的行政或司法要求所必须；</li>
            <li>在法律要求或允许的范围内，为了保护本公司、您或社会公众的利益、财产或安全免遭损害而有必要提供。</li>
          </ul>
          <p className="mb-4" style={{ color: 'var(--foreground)' }}>
            <strong>2.2 我们不会将您的个人信息转让给任何公司、组织或个人。</strong>
          </p>
          <p className="mb-4" style={{ color: 'var(--foreground)' }}>
            <strong>2.3 我们仅在以下情况下，公开披露您的个人信息：</strong>
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2" style={{ color: 'var(--foreground)' }}>
            <li>获得您明确同意后；</li>
            <li>基于法律的披露：在法律、法律程序、诉讼或政府主管部门强制性要求的情况下，我们可能会公开披露您的个人信息。</li>
          </ul>
          <p className="mb-4" style={{ color: 'var(--foreground)' }}>
            <strong>2.4 与授权合作伙伴的共享：</strong>为实现本政策声明的目的，我们的某些服务将由授权合作伙伴（如提供短信发送服务的电信运营商）提供。我们仅会出于合法、正当、必要、特定、明确的目的共享您的信息，并且只会共享提供服务所必要的个人信息。同时，我们会与合作伙伴签署严格的保密协议，要求他们按照我们的说明、本政策以及其他任何相关的保密和安全措施来处理信息。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>3. 我们如何保护您的个人信息</h2>
          <p className="mb-4" style={{ color: 'var(--foreground)' }}>
            我们已采取符合业界标准的安全防护措施来保护您提供的个人信息，防止数据遭到未经授权的访问、公开披露、使用、修改、损坏或丢失。例如，在您的浏览器与服务器之间交换数据时受SSL协议加密保护；同时对网站本身提供HTTPS安全访问方式。
          </p>
          <p className="mb-4" style={{ color: 'var(--foreground)' }}>
            我们将在中国境内存储您的个人信息，存储期限为实现本政策所述目的所必需的最短时间。我们的数据存储在阿里云符合国家要求的云服务上。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>4. 您的权利</h2>
          <p className="mb-4" style={{ color: 'var(--foreground)' }}>
            按照中国相关的法律、法规、标准，以及其他国家、地区的通行做法，我们保障您对自己的个人信息行使以下权利：
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2" style={{ color: 'var(--foreground)' }}>
            <li><strong>访问和更正您的个人信息：</strong>您有权访问和更正您的个人信息（法律规定的特殊情况除外）。</li>
            <li>
              <strong>删除您的个人信息：</strong>在以下情形中，您可以向我们提出删除个人信息的请求：
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>如果我们处理个人信息的行为违反法律法规；</li>
                <li>如果我们收集、使用您的个人信息，却未征得您的同意；</li>
                <li>如果您不再使用我们的产品或服务，或您主动注销了账号。</li>
              </ul>
            </li>
            <li><strong>改变您授权同意的范围：</strong>您可以通过注销账号的方式，撤销我们继续收集您个人信息的全部授权。</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>5. 我们如何处理儿童的个人信息</h2>
          <p className="mb-4" style={{ color: 'var(--foreground)' }}>
            我们的产品、网站和服务主要面向成人。如果没有父母或监护人的同意，儿童不应创建自己的个人信息主体账户。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>6. 本政策如何更新</h2>
          <p className="mb-4" style={{ color: 'var(--foreground)' }}>
            我们的隐私政策可能变更。未经您明确同意，我们不会削减您按照本隐私政策所应享有的权利。我们会在本页面上发布对隐私政策所做的任何变更。对于重大变更，我们还会提供更为显著的通知（包括网站公告等方式）。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>7. 如何联系我们</h2>
          <p className="mb-4" style={{ color: 'var(--foreground)' }}>
            如果您对本隐私政策有任何疑问、意见或建议，或需要行使您的相关权利，请通过以下方式与我们联系：<strong>support@vocoapp.co</strong>
          </p>
          <p className="mb-4" style={{ color: 'var(--foreground)' }}>
            如果您对我们的回复不满意，特别是认为我们的个人信息处理行为损害了您的合法权益，您还可以通过您所在地的网信、公安、市场监管等监管部门的投诉举报渠道进行申诉。
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

export default PrivacyPolicy;

