# Start an existing VM in Devtest lab

$resGroupName = "inft2031_devTestRG338459"
$vmName = "c3220929Desk1"
Get-AzureRmVM -ResourceGroupName $resGroupName -Name $vmName 
Start-AzureRmVM -ResourceGroupName $resGroupName -Name $vmName


