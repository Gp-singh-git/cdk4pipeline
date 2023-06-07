#!/bin/bash
set -eu

#if [ "a${TARGET_ENV}" == "a" ]; then
#    echo "No TARGET_ENV is set"
#  exit 255
#else
#    echo "Building for ${TARGET_ENV}"
#fi


#pushd ../citizen/web
#ENDPOINT=`aws cloudformation describe-stacks --stack-name "${TARGET_ENV}-env" | grep "OutputKey\": \"APIEndpoint" -A3 | grep OutputValue | awk -F\" '{print $4}'`

#echo "REACT_APP_SERVICES_URL=${ENDPOINT}" > .env
#cat .env
# npm install --no-progress --unsafe-perm
#npm run test -- --watchAll=false
npm run build --no-progress
# npm run audit-app
#find ./build
#popd

# aws s3 cp "./build/" "s3://${TARGET_ENV}-${BUCKETSUFFIX}-artifacts/ct-web/${ReleaseID}/" --recursive
# aws s3 cp "../locales" "s3://${CONFIG_BUCKET}/ct-web/${ReleaseID}/locales" --recursive
aws s3 cp "./build/" "s3://${TARGET_ENV}-${BUCKETSUFFIX}/" --recursive
aws s3 cp "../locales" "s3://${TARGET_ENV}-${BUCKETSUFFIX}/locales" --recursive
aws cloudfront create-invalidation --distribution-id ${DISTRIBUTIONID}”. --paths "/*"
