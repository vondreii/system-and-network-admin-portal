#Login-AzureRMAccount

#Variables for VHD location, resource groups, etc
$destinationVhd = "https://vmprojectstorage.blob.core.windows.net/bob-the-blob/w10v2.vhd"
$virtualNetworkName = "VirtualNetwork"
$locationName = "AustraliaEast"
$resourceGroupName = "resourceGroup1"

#Configuration of VM:
$ComputerName = "VMDesktop1"
$virtualNetwork = Get-AzureRmVirtualNetwork -ResourceGroupName $resourceGroupName -Name $virtualNetworkName
$publicIp = New-AzureRmPublicIpAddress -Name "srvpublic" -ResourceGroupName $ResourceGroupName -Location $locationName -AllocationMethod Dynamic
$networkInterface = New-AzureRmNetworkInterface -ResourceGroupName $resourceGroupName -Name "srvinterface" -Location $locationName -SubnetId $virtualNetwork.Subnets[0].Id -PublicIpAddressId $publicIp.Id

#VM login credentials for VM: 
$VMLocalAdminUser = "LocalAdminUser"
$VMLocalAdminSecurePassword = ConvertTo-SecureString "Password" -AsPlainText -Force 
$Credential = New-Object System.Management.Automation.PSCredential ($VMLocalAdminUser, $VMLocalAdminSecurePassword); 

#If you want to view available VMsizes for location:
#Get-AzureRmVMSize $locationName | Out-GridView 

#Creating the Virtual Machine:
$vmConfig = New-AzureRmVMConfig -VMName $ComputerName -VMSize "Standard_DS1"
$vmConfig = Set-AzureRmVMOSDisk -VM $vmConfig -Name "AcmeSrv" -VhdUri $destinationVhd -CreateOption Attach -Windows
$vmConfig = Add-AzureRmVMNetworkInterface -VM $vmConfig -Id $networkInterface.Id
$vm = New-AzureRmVM -VM $vmConfig -Location $locationName -ResourceGroupName $resourceGroupName

#Error for VM Agent or Extensions 
#Add VM Agent
$svc = "svc"
$vm = Get-AzureVM –ServiceName $svc –Name $ComputerName
$vm.VM.ProvisionGuestAgent = $TRUE
Update-AzureVM –Name $ComputerName –VM $vm.VM –ServiceName $svc

