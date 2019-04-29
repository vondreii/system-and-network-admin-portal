$rgName = "resourcegroup1"
$urlOfUploadedImageVhd = "https://vmprojectstorage.blob.core.windows.net/bob-the-blob/w10v2.vhd"
Add-AzureRmVhd -ResourceGroupName $rgName -Destination $urlOfUploadedImageVhd `
    -LocalFilePath "C:\w10v2.vhd"
