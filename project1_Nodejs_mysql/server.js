const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

app.use(express.static('public'));

// Cấu hình kết nối
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '123456',
    database: process.env.DB_NAME || 'test_db',
    port: process.env.DB_PORT || 3306
};

let db;

// Hàm kết nối Database (Viết lại để tạo connection mới mỗi lần retry)
const connectDatabase = () => {
    console.log('⏳ Đang thử kết nối tới MySQL...');
    
    // Tạo connection mới mỗi lần gọi hàm này
    db = mysql.createConnection(dbConfig);

    db.connect((err) => {
        if (err) {
            console.error('⚠️ Kết nối thất bại (MySQL chưa sẵn sàng), thử lại sau 5 giây...');
            // Hủy object cũ để tránh rò rỉ bộ nhớ
            db.end(); 
            // Thử lại sau 5s
            setTimeout(connectDatabase, 5000);
        } else {
            console.log('✅ Đã kết nối Database MySQL thành công!');
            console.log(`🔌 Host: ${dbConfig.host}`);
        }
    });

    // Xử lý khi đang chạy mà bị mất kết nối (VD: Restart DB)
    db.on('error', (err) => {
        console.error('❌ Lỗi kết nối DB:', err.code);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            connectDatabase(); // Kết nối lại
        }
    });
};

// Bắt đầu kết nối
connectDatabase();

app.get('/api/info', (req, res) => {
    res.json({ 
        message: `Web đang chạy trên môi trường: ${process.env.DB_HOST ? 'DOCKER' : 'LOCAL'}. DB Host: ${dbConfig.host}` 
    });
});

app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});