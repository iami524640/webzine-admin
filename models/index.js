const path = require('path');
const Sequelize = require('sequelize')

//DB연결정보가 있는 config파일에서 development항목의 DB정보를 조회한다.
const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname,'..','config','config.json'))[env];

//DB관리 객체 생성
const db ={};

//시퀄라이즈 ORM객체 생성
//시퀄라이즈 ORM객체 생성시 관련 DB연결정보 전달생성
const sequelize = new Sequelize(config.database,config.username,config.password,config);

//DB객체에 시퀄라이즈 객체를 속성에 바인딩한다.
//DB객체에 시퀄라이즈 모듈을 속성에 바인딩한다.
db.sequelize = sequelize;
db.Sequelize = Sequelize;


//각종 정의모델모듈 추가 및 관계정의
//하기 코드가 실행되면서 물리적 테이블이 생성된다.
db.User = require('./user')(sequelize,Sequelize);
db.Board = require('./board')(sequelize,Sequelize);
db.Article = require('./article')(sequelize,Sequelize);
db.Comment = require('./comment')(sequelize,Sequelize);
db.ArticleFile = require('./articlefile')(sequelize,Sequelize);
db.HashTag = require('./hashtag.js')(sequelize,Sequelize);

//테이블간 관계정의하기

//게시판 과 게시글 테이블간 1:N관계 정의하기
//1:N 관계의 경우
//hasMany,belongsTo메소드를 통해 1:N 관계설정이 가능하다
//관계가 설정되면 참조하는 테이블인 게시글 테이블에 
//참조키 컬럼명이 boardId(참조테이블명+Id)가 생성됨.
db.Board.hasMany(db.Article);
db.Article.belongsTo(db.Board);


//게시글과 댓글 테이블간의 1:N관계설정
//관계설정으로 댓글테이블에 참조하는 테이블명+Id 컬럼명(articleId) 형식으로 참조컬럼이 자동추가됨
db.Article.hasMany(db.Comment);
db.Comment.belongsTo(db.Article);

//게시글과 게시글첨부파일 테이블간의 1:N관계설정
//관계설정으로 첨부파일테이블에 articleId 참조(Foreign Key)컬럼이 자동생성됨
db.Article.hasMany(db.ArticleFile);
db.ArticleFile.belongsTo(db.Article);


//게시글 과 게시글해시태그간 다대다(N:M) 관계설정
//다대다 관계 설정을 통해 관련 테이블(articletags)과 컬럼이 자동생성됨
//articleId 컬럼과 hashtagId 컬럼이 자동으로 생성됨
db.Article.belongsToMany(db.HashTag,{ through:'ArticleTags'});
db.HashTag.belongsToMany(db.Article,{ through:'ArticleTags'});


//DB관리객체 모듈 출력
module.exports = db;

