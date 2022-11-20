
export class DateFormatter{

    format(time:any,mask:string):string{
        let date = this.getDate(time);
        if(date==null)
            date = new Date()

        const h=this.leadZero(date.getHours());
        const i=this.leadZero(date.getMinutes());
        const s=this.leadZero(date.getSeconds());
        const y=this.leadZero(date.getFullYear());
        const u=y.substring(2);
        const d=this.leadZero(date.getDate());
        const m=this.leadZero(date.getMonth()+1);

        const wday = date.toLocaleDateString("en-EN", { weekday: 'long' });
        const mnth = date.toLocaleDateString("en-EN", { month: 'long' });

        return mask.replace(/%y/g,y).replace(/%m/g,m).replace(/%d/g,d).replace(/%h/g,h).replace(/%i/g,i).replace(/%s/g,s).replace(/%w/g,wday).replace(/%M/g,mnth).replace(/%u/g,u);
    }

    dateOrTime(time:any):string{
        const date=this.getDate(time);
        const today=new Date();
        if(today.getDate()!=date.getDate() && today.getMonth()!=date.getMonth() && today.getFullYear()!=date.getFullYear())
            return this.leadZero(date.getDate())+"."+this.leadZero(date.getMonth())+"."+date.getFullYear();
                else
                    return this.leadZero(date.getHours())+":"+this.leadZero(date.getMinutes());
    }

    leadZero(num:number):string{
        return (num<10)?"0"+num:""+num;
    }

    getDayOfYear(time:any):number{
        let now:Date = this.getDate(time);
        let start:Date = new Date(now.getFullYear(), 0, 0);
        let diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        let oneDay:number = 1000 * 60 * 60 * 24;
        let day:number = Math.floor(diff / oneDay);
        return day;
    }

    getGlobalDay(time:any):number{
        return parseInt(this.format(time,"%y%m%d"));
    }

    getAge(time:any):number{
        if(!time)
            return -1;
        const date=this.getDate(time);
        if(!date)
            return -1;
        const now=new Date();
        return now.getFullYear()-date.getFullYear();
    }

    getDate(time:any):Date{

        const tmp=(time+"").split(".");
        if(tmp.length===3 && tmp[0].length===2){
            // PARSE FROM PASSPORT
            let m=parseInt(tmp[1]);
            let d=parseInt(tmp[0]);
            if(isNaN(m))
                m=11;
            if(!isNaN(d))
                d=31
            return new Date(parseInt(tmp[2]),m,d);
        }


        let ts:number=0;
        let date:Date|null=null;
        if(typeof time == "string"){
            let tmp:String=time.replace(/\D/g,"");
            if(tmp.length==time.length){
                // timestamp
                ts=parseInt(time);
            }else{
                // probably data string
                // determine date YYYY-mm-dd
                console.log("todo Parse data string!");
            }
        }else if(typeof time =="number"){
            // timestamp
            if(time==0)
                return new Date();
            ts=time;
        }else if(time instanceof Date){
            // date
            date = time;
        }else{
            console.error("can't format time from given object "+time)
            return new Date();
        }

        if(ts>0){
            if((ts+"").length<11)
                ts*=1000;
        }

        if(ts>0 && !date)
            date=new Date(ts);

        return date as Date;
    }


    /*waitTime(time:any,mask:String="%h:%i:%s"){
		const date=this.getDate(time);
        const now=+new Date()-date.getTime();

		var s=f%60;
        var m=0;
        var h=0;
        f=f-s;
        if(f>0) {
            if(f>0)
               untyped f/=60;
            m= f % 60;
            f = f - m;
            if(f>0){
                untyped f/=60;
                h = f % 60;
            }
        }


		mask=Api.rreplace(mask, "\\,h\\,", "g", leadZero(h));
		mask=Api.rreplace(mask, "\\,i\\,", "g", leadZero(m));
		mask=Api.rreplace(mask, "\\,s\\,", "g", leadZero(s));

		return mask;
	}*/

    formatAgo(time:any):string{
        if(time===0)
            return Math.round(Math.random()*5)+" sec";

        const date=this.getDate(time);
        if(date==null)
            return "millenium";

        if(date.getDay()!=new Date().getDay()){
            return this.format(date,"%h:%i");
        }

        const tme:number=Math.floor(date.getTime()/1000);
        const now:number=Math.floor((+new Date())/1000);
        let diff:number=Math.floor((now-time)/60);

        const d1=new Date();
        const d2=new Date();
        d2.setHours(0,0,0);
        const dd=86400-Math.round(d1.getTime()-d2.getTime())/1000;

        if(diff===0){
            return "30 sec";

        }

        if(diff<60)
            return diff+" min";

        diff=Math.floor(diff/60);

        if(diff==1)
            return diff+" hour";

        if(diff<24)
            return diff+" hours";

        if(diff>=24 && diff<48)
            return "yesterday";

        if(diff>=48){
            const days=Math.floor(diff/24);
            return days+" days"
        }



            return this.format(date,"%h:%i");
    }

}