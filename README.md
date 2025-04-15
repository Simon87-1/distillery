# Distillery on FHIR

## Back end
```
cd <root of installation>
python backend/src/main.py
```

## Front end
```
cd <root of installation>/frontend_next

# If not already run
npm install

npm run dev
```

## Cerner how-to

Navigate to [Cerner Sandbox](https://smart.cerner.com/smart/ec2458f2-1e24-41c8-b71b-0e701af7583d/apps/3aa04ce1-05da-4907-af1e-98cce886e6ed/?PAT_PersonId=12724065&VIS_EncntrId=97953483&USR_PersonId=12742069&username=portal&need_patient_banner=true) 

Login with `portal/portal` if prompted

## Oscar how-to
1. In your backend `.env` file set `EMR=oscar` and `REACT_APP_CLIENT_ID_oscar-provider-distillery="0oahb8108uHblYUrv1d7"`
2. Navigate to https://apps-health.kai-oscar.com and login as pentavere
3. In the search box, type `GUPTA` and press enter
4. In the pop-up window, click on `794518` for Gupta, Adarsh
5. In the next pop-up window you can launch distillery by clicking `>` on top left of screen and then clicking on `Pentavere`
6. Or, you can upload a new document for the patient by clicking `Add Document`, fill out all the fields on the pop-up and click `Add`


