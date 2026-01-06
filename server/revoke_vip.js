const User = require('./models/User');
const sequelize = require('./database');

(async () => {
  try {
    const targetPhone = '13929596132';
    console.log(`正在撤销用户 VIP 权限: ${targetPhone}...`);
    
    const user = await User.findOne({ where: { phoneNumber: targetPhone } });

    if (!user) {
      console.log('❌ 数据库中未找到该用户。');
    } else {
      // Update fields to remove VIP status
      user.subscriptionStatus = 'free';
      user.subscriptionExpiresAt = null;
      user.originalTransactionId = null;
      
      await user.save();
      
      console.log('✅ 用户 VIP 权限已撤销。');
      console.log('-----------------------------------');
      console.log('当前状态:');
      console.log('订阅状态:', user.subscriptionStatus);
      console.log('过期时间:', user.subscriptionExpiresAt);
      console.log('原始交易ID:', user.originalTransactionId);
      console.log('-----------------------------------');
    }
  } catch (error) {
    console.error('操作出错:', error);
  } finally {
    await sequelize.close();
  }
})();
