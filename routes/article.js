
var express  = require('express');
//const Sequelize = require('sequelize');

//라우터에서 사용하고자 하는 모델 객체를 조회한다.
const models = require('../models/index.js');
const Sequelize = models.Sequelize;
const Op = models.Sequelize.Op;

var Article = require('../models/index.js').Article;
var Board = require('../models/index.js').Board;
var User = models.User;

//라우터 객체 생성
var router = express.Router();

//전체 게시글 정보조회
//http://localhost/articles
router.get('/',function(req,res,next){
  Article.findAll()
  .then((articles) => {
    res.json(articles);
  })
  .catch((err) => {
    console.log(err);
    next(err);
  });

});


//게시글 옵션정보 조회
router.get('/search',function(req,res,next){

  console.log('조회옵션:',req.query);
  console.log('조회옵션 제목=',req.query.title);

  let searchOption ={ displayyn:true };


  // 제목 조회 필터 옵션 추가
  if(req.query.title.length > 0){
      Object.assign(searchOption,{ title:req.query.title});
  }

  //선택 게시판 게시글만 조회옵션 추가
  if(req.query.boardid > 0){
    //where displayyn=1 and title=aa and boardId=1
    Object.assign(searchOption,{ boardId:req.query.boardid});
  }

  //선택 게시글 분류 게시글만 조회옵션 추가
  if(req.query.categoryid > 0){
    //where displayyn=1 and title=aa and boardId=1 and categoryid=1
    Object.assign(searchOption,{ categoryid:req.query.categoryid});
  }

  Article.findAll({
    include:{ model:Board},
    attributes:['id','title','categoryid','contents','viewcount','ipaddress','displayyn','boardId','updatedAt'],
    where:searchOption,
    order:[[ 'id','DESC']]
  })
  .then((articles) => {

    console.log(articles);

    res.json(articles);
  })
  .catch((err) => {
    console.log(err);
    next(err);
  });

});


//게시글등록 기능
router.post('/',function(req,res,next){

  Article.create({
      title:req.body.title,
      categoryid:req.body.categoryid,
      contents:req.body.contents,
      viewcount:0,
      ipaddress:req.connection.remoteAddress,
      displayyn:req.body.displayyn,
      boardId:req.body.boardId,
      createduid:1,
      updateduid:1,
})
.then((result) =>{
  console.log(result);
  res.status(201).json(result);
})
.catch((err) => {
  console.error(err);
  next(err);
})

});


//게시글 정보 수정
router.patch('/:id', function(req, res, next) {
  Article.update(
    { 
      title: req.body.title,
      categoryid:req.body.categoryid,
      contents: req.body.contents, 
      ipaddress:req.connection.remoteAddress,
      displayyn:req.body.displayyn,
      boardId:req.body.boardId,
      updateduid:1,
    }, 
    { 
      where: { id: req.params.id } 
    })
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
});

//메인 게시글 목록 조회1:Promise방식:일반방식-비추천
router.get('/main',function(req,res,next){

  //클라이언트로 반환할 데이터 구조 정의 :View Model 구조정의
  var returnVM =
  { 
    mainInfo:{ title:'홈페이지 방문을 환영합니다1.',desc:'웹진 사이트에서 다양한 기술 블로깅 정보를 제공하고 있습니다1.'},
    topArticles:[],
    nodeInfo:[],
    etc:[],
    vueInfo:[]
  };
  
  //단계별로 관련 데이터 목록 조회 진행 후 최종 뷰모델 데이터 리턴처리

  //Step1: 최신게시글 4개조회
  Article.findAll({
    attributes:['id','title','categoryid','contents','viewcount','ipaddress','displayyn','boardId','updatedAt'],
    where:{displayyn:true},
    order:[[ 'id','DESC']],
    limit:4,
  })
  .then((articles) => {

    returnVM.topArticles = articles;

        //Step2: 노드게시글 2개조회
        Article.findAll({
          attributes:['id','title','categoryid','contents','viewcount','ipaddress','displayyn','boardId','updatedAt'],
          where:{displayyn:true},
          order:[[ 'id','DESC']],
          limit:2,
        })
        .then((articles) => {
            returnVM.nodeInfo = articles;

                //Step3: 리액트,앵귤러 2개 조회
                Article.findAll({
                  attributes:['id','title','categoryid','contents','viewcount','ipaddress','displayyn','boardId','updatedAt'],
                  where:{displayyn:true},
                  order:[[ 'id','DESC']],
                  limit:2,
                })
                .then((articles) => {
                    returnVM.etc = articles;
    
                        //Step4: Vue게시글 3개조회
                        Article.findAll({
                          attributes:['id','title','categoryid','contents','viewcount','ipaddress','displayyn','boardId','updatedAt'],
                          where:{displayyn:true},
                          order:[[ 'id','DESC']],
                          limit:3,
                        })
                        .then((articles) => {
                            returnVM.vueInfo = articles;

                            //최종 ViewModel 데이터 리턴
                            res.json(returnVM);
                        })
                        .catch((err) => {
                          console.log(err);
                          next(err);
                        });
                })
                .catch((err) => {
                  console.log(err);
                  next(err);
                });
        })
        .catch((err) => {
          console.log(err);
          next(err);
        });

  })
  .catch((err) => {
    console.log(err);
    next(err);
  });

});

//메인 게시글 목록 조회1:Promise방식2 :추천방식:리턴값 처리방식 적용
router.get('/main1',(req,res)=>{

  //클라이언트로 반환할 데이터 구조 정의 :View Model 구조정의
  var returnVM =
  { 
    mainInfo:{ title:'홈페이지 방문을 환영합니다1.',desc:'웹진 사이트에서 다양한 기술 블로깅 정보를 제공하고 있습니다1.'},
    topArticles:[],
    nodeInfo:[],
    etc:[],
    vueInfo:[]
  };
  
  //단계별로 관련 데이터 목록 조회 진행 후 최종 뷰모델 데이터 리턴처리

  //Step1: 최신게시글 4개조회
  Article.findAll({
    attributes:['id','title','categoryid','contents','viewcount','ipaddress','displayyn','boardId','updatedAt'],
    where:{displayyn:true},
    order:[[ 'id','DESC']],
    limit:4,
  })
  .then((articles) => {

    returnVM.topArticles = articles;

        //Step2: 노드게시글 2개조회
        Article.findAll({
          attributes:['id','title','categoryid','contents','viewcount','ipaddress','displayyn','boardId','updatedAt'],
          where:{displayyn:true},
          order:[[ 'id','DESC']],
          limit:2,
        })
        .then((articles) => {
            returnVM.nodeInfo = articles;

                //Step3: 리액트,앵귤러 2개 조회
                Article.findAll({
                  attributes:['id','title','categoryid','contents','viewcount','ipaddress','displayyn','boardId','updatedAt'],
                  where:{displayyn:true},
                  order:[[ 'id','DESC']],
                  limit:2,
                })
                .then((articles) => {
                    returnVM.etc = articles;
    
                        //Step4: Vue게시글 3개조회
                        Article.findAll({
                          attributes:['id','title','categoryid','contents','viewcount','ipaddress','displayyn','boardId','updatedAt'],
                          where:{displayyn:true},
                          order:[[ 'id','DESC']],
                          limit:3,
                        })
                        .then((articles) => {
                            returnVM.vueInfo = articles;

                            //최종 ViewModel 데이터 리턴
                            res.json({
                                code:200,
                                result:returnVM,
                            });
                        })
                        .catch((err) => {
                          console.log(err);
                          return res.status(500).json({
                            code:500,
                            message:'서버 에러 발생'
                          });
                        });
                })
                .catch((err) => {
                  console.log(err);
                  return res.status(500).json({
                    code:500,
                    message:'서버 에러 발생'
                  });
                });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).json({
            code:500,
            message:'서버 에러 발생'
          });
        });

  })
  .catch((err) => {
    console.log(err);
    return res.status(500).json({
      code:500,
      message:'서버 에러 발생'
    });
  });

});

//메인 게시글 목록 조회2:async,await방식:추천방식
router.get('/main2',async(req,res) => {

  //클라이언트로 반환할 데이터 구조 정의 :View Model 구조정의
  var returnVM =
  { 
    mainInfo:{ title:'홈페이지 방문을 환영합니다1.',desc:'웹진 사이트에서 다양한 기술 블로깅 정보를 제공하고 있습니다1.'},
    topArticles:[],
    nodeInfo:[],
    etc:[],
    vueInfo:[]
  };

  //예외처리 블럭 처리
  try
  {

     //Step1: 최신게시글 4개조회
     //시퀄라이즈 사용법 참조: https://sequelize.org/master/manual/querying.html#attributes
    let articles = await Article.findAll({
      attributes:['id','title','categoryid','contents','viewcount','ipaddress','displayyn','boardId','updatedAt'],
      where:{
        displayyn:true,
        viewcount : { [Op.gte] : 0}, //이상
      },
      order:[[ 'id','DESC']],
      limit:4,
    });

    if(articles){
      returnVM.topArticles = articles;
    }

    //Step2: 노드 게시글 2개조회
    articles = await Article.findAll({
      attributes:['id','title','categoryid','contents','viewcount','ipaddress','displayyn','boardId','updatedAt'],
      where:{
        displayyn:true,
        categoryid : 1,
        viewcount : { [Op.gte] : 0}, //이상
      },
      order:[[ 'id','DESC']],
      limit:2,
    });

    if(articles){
      returnVM.nodeInfo = articles;
    }

    //Step3: 리액트/앵귤러 게시글 2개조회
    articles = await Article.findAll({
      attributes:['id','title','categoryid','contents','viewcount','ipaddress','displayyn','boardId','updatedAt'],
      where:{
        displayyn:true,
        [Op.or]:[{categoryid : 3},{categoryid : 4}], //(categoryid = 3 or category=4)
        viewcount : { [Op.gte] : 0}, //viewcount >=0 
      },
      order:[[ 'id','DESC']],
      limit:2,
    });

    if(articles){
      returnVM.etc = articles;
    }

    //Step4: 뷰 게시글 3개조회
    articles = await Article.findAll({
      attributes:['id','title','categoryid','contents','viewcount','ipaddress','displayyn','boardId','updatedAt'],
      where:{
        displayyn:true,
        categoryid : 2,
        viewcount : { [Op.gte] : 0}, //이상
      },
      order:[[ 'id','DESC']],
      limit:3,
    });

    if(articles){
      returnVM.vueInfo = articles;
    }


    //최종 조회 뷰모델 데이터 리턴
    return res.json({
      code:200,
      result:returnVM 
    });

  }catch(error){
    console.log(error);
    return res.status(500).json({ code:500,message:'서버에러발생'});
  }


});


//메인 게시글 목록 조회2:async,await방식:추천방식
router.get('/main3',async(req,res) => {

  //클라이언트로 반환할 데이터 구조 정의 :View Model 구조정의
  var returnVM =
  { 
    mainInfo:{ title:'홈페이지 방문을 환영합니다1.',desc:'웹진 사이트에서 다양한 기술 블로깅 정보를 제공하고 있습니다1.'},
    topArticles:[],
    nodeInfo:[],
    etc:[],
    vueInfo:[]
  };

  //예외처리 블럭 처리
  try
  {

     //Step1: 최신게시글 4개조회
     //시퀄라이즈 사용법 참조: https://sequelize.org/master/manual/querying.html#attributes
    let articles = await Article.findAll({
      attributes:['id','title','categoryid',['contents', 'desc'],
      [Sequelize.literal('CASE WHEN categoryid = 1 THEN "Node.js" WHEN categoryid = 2 THEN "Vue.js" WHEN categoryid = 3 THEN "React.js" WHEN categoryid = 4 THEN "Angular.js" ELSE "ss" END'), 'categoryName'],
      'viewcount','ipaddress','displayyn','boardId','updatedAt'],
      where:{
        displayyn:true,
        viewcount : { [Op.gte] : 0}, //이상
      },
      order:[[ 'id','DESC']],
      limit:4,
    });

    if(articles){
      returnVM.topArticles = articles;
    }

    //Step2: 노드 게시글 2개조회
    articles = await Article.findAll({
      attributes:['id','title','categoryid',['contents', 'desc'],
      [Sequelize.literal('CASE WHEN categoryid = 1 THEN "Node.js" WHEN categoryid = 2 THEN "Vue.js" WHEN categoryid = 3 THEN "React.js" WHEN categoryid = 4 THEN "Angular.js" ELSE "ss" END'), 'categoryName'],
      'viewcount','ipaddress','displayyn','boardId','updatedAt'],
      where:{
        displayyn:true,
        categoryid : 1,
        viewcount : { [Op.gte] : 0}, //이상
      },
      order:[[ 'id','DESC']],
      limit:2,
    });

    if(articles){
      returnVM.nodeInfo = articles;
    }

    //Step3: 리액트/앵귤러 게시글 2개조회
    articles = await Article.findAll({
      attributes:['id','title','categoryid',['contents', 'desc'],
      [Sequelize.literal('CASE WHEN categoryid = 1 THEN "Node.js" WHEN categoryid = 2 THEN "Vue.js" WHEN categoryid = 3 THEN "React.js" WHEN categoryid = 4 THEN "Angular.js" ELSE "ss" END'), 'categoryName'],
      'viewcount','ipaddress','displayyn','boardId','updatedAt'],
      where:{
        displayyn:true,
        [Op.or]:[{categoryid : 3},{categoryid : 4}], //(categoryid = 3 or category=4)
        viewcount : { [Op.gte] : 0}, //viewcount >=0 
      },
      order:[[ 'id','DESC']],
      limit:2,
    });

    if(articles){
      returnVM.etc = articles;
    }

    //Step4: 뷰 게시글 3개조회
    articles = await Article.findAll({
      attributes:['id','title','categoryid',['contents', 'desc'],
      [Sequelize.literal('CASE WHEN categoryid = 1 THEN "Node.js" WHEN categoryid = 2 THEN "Vue.js" WHEN categoryid = 3 THEN "React.js" WHEN categoryid = 4 THEN "Angular.js" ELSE "ss" END'), 'categoryName'],
      'viewcount','ipaddress','displayyn','boardId','updatedAt'],
      where:{
        displayyn:true,
        categoryid : 2,
        viewcount : { [Op.gte] : 0}, //이상
      },
      order:[[ 'id','DESC']],
      limit:3,
    });

    if(articles){
      returnVM.vueInfo = articles;
    }


    //최종 조회 뷰모델 데이터 리턴
    return res.json({
      code:200,
      result:returnVM 
    });

  }catch(error){
    console.log(error);
    return res.status(500).json({ code:500,message:'서버에러발생'});
  }


});



//단일 게시글 정보조회
//:패턴을 사용하는경우는 다른 라우터부터 가장 뒤쪽에 구현해 기본 라우터 기능을 방해하지 말아야한다.
router.get('/:id',function(req,res,next){
  
  Article.findOne({
    where:{
      id: req.params.id,
    }
    })
  .then((article) => {
    res.json(article);
  })
  .catch((err) => {
    console.log(err);
    next(err);
  })
});


//게시글 정보 삭제
//:패턴을 사용하는경우는 다른 라우터부터 가장 뒤쪽에 구현해 기본 라우터 기능을 방해하지 말아야한다.
router.delete('/:id', function(req, res, next) {
  Article.destroy({ where: { id: req.params.id } })
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
});






//사용자 정보관리 전용 User라우터를 외부에 노출한다.
module.exports = router;
