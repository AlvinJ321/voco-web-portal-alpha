超过QPS限制后，请求不会自动排队，而是直接被拒绝。因此，您需要自行调整请求频率，避免短时间内发送过多请求。

超过QPS限制的后果

当您的请求超过QPS限制时，系统会拒绝超出限制的请求，并返回错误信息。

Throttling.User : Request was denied due to user flow control.

试用版一秒钟最多同时两个请求

商用版200个

怎么自己通过代码控制每秒最多2个请求？