module.exports =(sequelize,DataTypes) => {

    //users 테이블과 맵핑되는 user모델 정의 
    return sequelize.define('user',{
        email:{
            type:DataTypes.STRING(50),
            allowNull:false,//not null
            unique:true,
        },
        userpwd:{
            type:DataTypes.STRING(100),
            allowNull:false,//not null
        },
        nickname:{
            type:DataTypes.STRING(50),
            allowNull:false,//not null
        },
        entrytype:{
            type:DataTypes.STRING(10),
            allowNull:false,//not null
        },
        snsid:{
            type:DataTypes.STRING(50),
            allowNull:true,//null
        },
        username:{
            type:DataTypes.STRING(50),
            allowNull:true,//null
        },
        telephone:{
            type:DataTypes.STRING(20),
            allowNull:true,//null
        },
        photo:{
            type:DataTypes.STRING(100),
            allowNull:false,//not null
        },
        lastip:{
            type:DataTypes.STRING(20),
            allowNull:false,//not null
        },
        lastcontact:{
            type:DataTypes.DATE,
            allowNull:false,//not null
            defaultValue:DataTypes.NOW,
        },
        usertype:{
            type:DataTypes.STRING(1),
            allowNull:false,//not null
        },
        userstate:{
            type:DataTypes.STRING(1),
            allowNull:false,//not null
        },
    },{
        timestamps:true,
        paranoid:true
    });

    //timestamps 는 물리적 테이블 createdAt,updatedAt컬럼을 자동추가하고
    //데이터 신규생성일시,수정일시 데이터를 자동으로 마킹해줍니다.
    //paranoid가 트루이면 deletedAt컬럼이 자동추가되고
    //삭제시 삭제일시정보가 자동 마킹되고 데이터는 실제 삭제되지 않습니다.

};