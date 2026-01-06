const User = require('./models/User');
const sequelize = require('./database');

(async () => {
  try {
    const targetPhone = '13929596132';
    console.log(`正在查询用户: ${targetPhone}...`);
    
    const user = await User.findOne({ where: { phoneNumber: targetPhone } });

    if (!user) {
      console.log('❌ 数据库中未找到该用户。');
    } else {
      console.log('✅ 找到用户:', user.id);
      console.log('-----------------------------------');
      console.log('订阅状态 (subscriptionStatus):', user.subscriptionStatus);
      console.log('过期时间 (subscriptionExpiresAt):', user.subscriptionExpiresAt);
      console.log('原始交易ID (originalTransactionId):', user.originalTransactionId);
      console.log('-----------------------------------');
      
      const now = new Date();
      const isVip = user.subscriptionStatus === 'active' && 
                    user.subscriptionExpiresAt && 
                    new Date(user.subscriptionExpiresAt) > now;
      
      console.log(`👉 最终判断: 该用户目前 ${isVip ? '是 VIP 🟢' : '不是 VIP 🔴'}`);
    }
  } catch (error) {
    console.error('查询出错:', error);
  } finally {
    await sequelize.close();
  }
})();