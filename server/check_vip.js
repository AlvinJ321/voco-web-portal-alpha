const User = require('./models/User');
const sequelize = require('./database');

function getArgValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  const value = process.argv[idx + 1];
  if (!value || value.startsWith('--')) return null;
  return value;
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function printUsage() {
  console.log('Usage:');
  console.log('  node check_vip.js --phone <phoneNumber>');
  console.log('  node check_vip.js --userId <userId>');
}

(async () => {
  try {
    if (hasFlag('--help') || hasFlag('-h')) {
      printUsage();
      process.exit(0);
    }

    const phone = getArgValue('--phone');
    const userIdRaw = getArgValue('--userId');

    if ((!phone && !userIdRaw) || (phone && userIdRaw)) {
      printUsage();
      process.exit(1);
    }

    let user;
    if (phone) {
      console.log(`正在查询用户: ${phone}...`);
      user = await User.findOne({ where: { phoneNumber: phone } });
    } else {
      const userId = Number.parseInt(userIdRaw, 10);
      if (!Number.isFinite(userId)) {
        console.error('Invalid --userId');
        process.exit(1);
      }
      console.log(`正在查询用户: userId=${userId}...`);
      user = await User.findByPk(userId);
    }

    if (!user) {
      console.log('❌ 数据库中未找到该用户。');
    } else {
      const now = new Date();
      const expiresAt = user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) : null;
      const isPro = user.subscriptionStatus === 'active' && expiresAt && expiresAt > now;
      const isTrial = user.subscriptionStatus === 'trial' && expiresAt && expiresAt > now;
      const tier = isPro ? 'pro' : isTrial ? 'trial' : 'free';

      console.log('✅ 找到用户');
      console.table([{
        userId: user.userId,
        phoneNumber: user.phoneNumber,
        tier,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        trialUsedAt: user.trialUsedAt,
        originalTransactionId: user.originalTransactionId,
      }]);
    }
  } catch (error) {
    console.error('查询出错:', error);
  } finally {
    await sequelize.close();
  }
})();
