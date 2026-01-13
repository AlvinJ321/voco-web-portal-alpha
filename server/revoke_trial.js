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
  console.log('  node revoke_trial.js --phone <phoneNumber> [--reset-used]');
  console.log('  node revoke_trial.js --userId <userId> [--reset-used]');
  console.log('');
  console.log('Options:');
  console.log('  --reset-used   Also clears trialUsedAt so user can start trial again');
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
    const resetUsed = hasFlag('--reset-used');
    const dryRun = hasFlag('--dry-run');

    if ((!phone && !userIdRaw) || (phone && userIdRaw)) {
      printUsage();
      process.exit(1);
    }

    let user;
    if (phone) {
      user = await User.findOne({ where: { phoneNumber: phone } });
    } else {
      const userId = Number.parseInt(userIdRaw, 10);
      if (!Number.isFinite(userId)) {
        console.error('Invalid --userId');
        process.exit(1);
      }
      user = await User.findByPk(userId);
    }

    if (!user) {
      console.error('User not found.');
      process.exit(1);
    }

    const before = {
      userId: user.userId,
      phoneNumber: user.phoneNumber,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
      trialUsedAt: user.trialUsedAt,
      originalTransactionId: user.originalTransactionId,
    };

    const shouldRevokeTrial = user.subscriptionStatus === 'trial';
    const shouldResetUsed = resetUsed && user.trialUsedAt;

    if (!shouldRevokeTrial && !shouldResetUsed) {
      console.log('No changes applied.');
      console.table([before]);
      process.exit(0);
    }

    if (shouldRevokeTrial) {
      user.subscriptionStatus = 'free';
      user.subscriptionExpiresAt = null;
    }
    if (shouldResetUsed) {
      user.trialUsedAt = null;
    }

    const after = {
      userId: user.userId,
      phoneNumber: user.phoneNumber,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
      trialUsedAt: user.trialUsedAt,
      originalTransactionId: user.originalTransactionId,
    };

    if (!dryRun) {
      await user.save();
    }

    console.log(dryRun ? 'Dry run complete.' : 'Trial revoked successfully.');
    console.log('Before:');
    console.table([before]);
    console.log('After:');
    console.table([after]);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
})();
