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
  console.log('  node revoke_vip.js --phone <phoneNumber>');
  console.log('  node revoke_vip.js --userId <userId>');
  console.log('');
  console.log('Options:');
  console.log('  --dry-run      Print changes without saving');
}

(async () => {
  try {
    if (hasFlag('--help') || hasFlag('-h')) {
      printUsage();
      process.exit(0);
    }

    const phone = getArgValue('--phone');
    const userIdRaw = getArgValue('--userId');
    const dryRun = hasFlag('--dry-run');

    if ((!phone && !userIdRaw) || (phone && userIdRaw)) {
      printUsage();
      process.exit(1);
    }
    
    let user;
    if (phone) {
      console.log(`正在撤销用户 VIP 权限: ${phone}...`);
      user = await User.findOne({ where: { phoneNumber: phone } });
    } else {
      const userId = Number.parseInt(userIdRaw, 10);
      if (!Number.isFinite(userId)) {
        console.error('Invalid --userId');
        process.exit(1);
      }
      console.log(`正在撤销用户 VIP 权限: userId=${userId}...`);
      user = await User.findByPk(userId);
    }

    if (!user) {
      console.log('❌ 数据库中未找到该用户。');
    } else {
      const before = {
        userId: user.userId,
        phoneNumber: user.phoneNumber,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        originalTransactionId: user.originalTransactionId,
      };

      user.subscriptionStatus = 'free';
      user.subscriptionExpiresAt = null;
      user.originalTransactionId = null;
      
      const after = {
        userId: user.userId,
        phoneNumber: user.phoneNumber,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        originalTransactionId: user.originalTransactionId,
      };

      if (!dryRun) {
        await user.save();
      }
      
      console.log(dryRun ? 'Dry run complete.' : '✅ 用户 VIP 权限已撤销。');
      console.log('Before:');
      console.table([before]);
      console.log('After:');
      console.table([after]);
    }
  } catch (error) {
    console.error('操作出错:', error);
  } finally {
    await sequelize.close();
  }
})();
